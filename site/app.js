"use strict";
var debug = require('debug')('app');
var express = require('express');
var session = require('express-session');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression')
var nunjucks  = require('nunjucks');
var dateFilter = require('nunjucks-date-filter');
var tool = require('leaptool');
var EventEmitter = require('events');
var _ = require('lodash');

var app = {};
app.db = null;
app.engine = require('web_engine')(app);

class MyEmitter extends EventEmitter {}
app.eventEmitter = new MyEmitter();
app.eventEmitter.on('extension::init', function(extensionName) {
  debug('extension init:', extensionName);
});

app.cb = function(error, docs, info, req, res, callback) {
  error && console.log('Error:', error);
  if (callback) {
    callback(error, docs, info, req, res);
  } else {
    var result = {
      error: error,
      docs: docs,
      info: info
    };
    app.sendJsonData(req, res, result);
  }
};

app.sendPlainText = function(req, res, contentString, contentType) {
  contentType = contentType || 'plain/text';
  res.writeHead(200, { 'Content-Type':contentType });
  res.write(contentString);
  res.end();
};

app.sendJsonData = function(req, res, data) {
  app.sendPlainText(req, res, JSON.stringify(data), 'application/json');
};

app.getPage = function(req, context) {
  var parameter = tool.getReqParameter(req);
  context = context || {};
  context.req = {
    url: req.url,
    method: req.method,
    headers: req.headers,
    cookies: req.cookies,
    params: req.params,
    query: req.query
  };
  context.user = req.session && req.session.user || null;
  context.title = context.title || context.page_name;
  context.message = parameter.message || parameter.app_message || null;
  context.user_module = app.setting.user_module || 'user';
  context.show_user_dropdown = !!app.setting.show_user_dropdown;
  context.googleAnalytics = app.setting.google && app.setting.google.analytics || null;
  return context;
};

app.renderInfoPage = function(error, docs, info, req, res) {
  var page = app.getPage(req, { error:error, docs:docs, info:info });
  res.render('common/info.html', { page: page });
};

function setup(cbSetup) {
  // create express server
  app.server = express();
  // read setting
  app.setting = tool.getDefaultSetting(__dirname);
  //debug('setting:', app.setting);
  var siteSetting = null;
  try {
    siteSetting = require('./setting').setting;
    debug('setting loaded');
    //debug('setting loaded:', JSON.stringify(siteSetting, null, 2));
  } catch (e) {
    debug('setting file is absent !!!');
  }
  app.setting = _.extend(app.setting, siteSetting);

  app.server.set('view engine', 'html');
  setupViewEngine(app);
  
  // setup middleware
  app.server.use(favicon(path.join(__dirname, app.setting.public_name, 'image', 'favicon.ico')));
  app.server.use(compression());
  app.server.use(logger('dev'));
  app.server.use(bodyParser.urlencoded({ extended: true }));
  app.server.use(bodyParser.json());
  app.server.use(cookieParser());
  app.server.use(session({
    secret: app.setting.session_secret,
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 120 * 60 * 1000 }  //session expires in 120 minutes
  }));
  app.server.use(express.static(path.join(__dirname, app.setting.public_name)));
  // redirect http to https
  if (app.setting.ssl && app.setting.ssl.http_redirect) {
    debug('enable http redirect to https');
    var redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
    app.server.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));
  }
  
  // middleware for api token check
  var apiRoutes = express.Router();
  apiRoutes.use(function(req, res, next) {
      app.module.admin.data.checkToken(req, res, next);
  });
  apiRoutes.use(function(req, res, next) {
      app.module.admin.data.checkAccess(req, res, next);
  });
  // all methods (GET, POST, ...) on /data will be checked on token
  app.server.all('/data/*', apiRoutes);

  // setup database connection
  if (app.setting.database && app.setting.database.type) {
    var Database = require(app.setting.database.type + '_db');
    app.db = new Database(app, function(error) {
      if (error) {
        // console.log(error.message);
        console.log("Error in connecting to database");
        console.log("Leapbase exits\n");
        process.exit();
      } else {
        setupModules(app, cbSetup);
      }
    });
  } else {
    setupModules(app, cbSetup);
  }
}

// setup modules under app_modules folder
function setupModules(app, cbSetup) {
  // load application modules from file
  app.module = {};
  var modulePath = path.join(app.setting.server_path, app.setting.app_modules_name);
  fs.readdir(modulePath, function(error, files) {
    if (error) {
      debug('Error in setupModules:', error);
      process.exit();
    } else {
      for (var i = 0; i < files.length; i++) {
        var module_name = files[i].split('.')[0];
        var modulePath = './' + app.setting.app_modules_name + '/' + module_name;
        app.module[module_name] = require(modulePath)(app);
      }
      setupServer(app, cbSetup);
    }
  });
}

// setup view engine and custom filters
function setupViewEngine(app) {
  // nunjucks setup
  const env = nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    noCache: true,
    express: app.server
  });
  env.addFilter('json', function (value, spaces) {
    if (!value) { return value; }
    spaces = spaces || 4;
    if (value instanceof nunjucks.runtime.SafeString) {
      value = value.toString();
    }
    const jsonString = JSON.stringify(value, null, spaces).replace(/</g, '\\u003c');
    return nunjucks.runtime.markSafe(jsonString);
  });
  env.addFilter('random', function (value) {
    if (!Array.isArray(value)) { return value; }
    var index = Math.floor(Math.random() * value.length)
    return value[index];
  });
  dateFilter.setDefaultFormat('YYYY/MM/DD')
  env.addFilter('date', dateFilter);
}

// setup web server properties
function setupServer(app, cbSetup) {
  debug('setup server');
  // catch 404 and forward to error handler
  app.server.use(function(req, res, next) {
    var err = new Error('Page Not Found');
    err.status = 404;
    next(err);
  });
  // error handler - will print stacktrace for development env
  app.server.use(function(err, req, res, next) {
    console.log('error:', err);
    res.status(err.status || 500);
    if (app.server.get('env') !== 'development') {
      err = null;
    }
    res.render('common/error', {
      message: err.message,
      error: err
    });
  });
  // invoke callback to continue setup
  cbSetup && cbSetup(app);
}

module.exports = function(callback) {
  // setup is asynchrous (database connect), so callback is needed to wait setup to complete
  setup(function(app) {
    // turn show_user_dropdown to true in setting if user module is loaded
    const userModuleName = app.setting['user_module'];
    app.setting.show_user_dropdown = !!app.module[userModuleName];
    callback && callback(app);
  });
};
