'use strict';
var debug = require('debug')('web');
var tool = require('leaptool');
var _ = require('lodash');

module.exports = function(app) {

  var module_name = 'web';
  app.eventEmitter.emit('extension::init', module_name);
  
  var block = {
    app: app,
    role: '',
    description: 'Web module',
    model: null,
    tags: ['web']
  };

  block.test = function() {
    return 'web test';
  };
  
  block.data = tool.object(require('basedata')(app, module_name));
  block.page = tool.object(require('basepage')(app, module_name, block.data));

  block.page.showIndexPage = function(req, res) {
    var comingSoonSetting = app.setting && app.setting.comming_soon || {};
    var parameter = tool.getReqParameter(req);
    var module_name = parameter['module_name'] || 'web';
    var page_name = parameter['page_name'] || 'index';
    var pageTitle = parameter['title'] || 'home';
    var page = app.getPage(req, {
      module_name: module_name,
      page_name: page_name,
      title: pageTitle
    });
    res.render([module_name, page_name + '.html'].join('/'), {
      app: app, req: req, page: page
    });
  };

  // page route
  app.server.get('/', block.page.showIndexPage);
  app.server.get('/:page_name', block.page.showPage);
  
  return block;
};
