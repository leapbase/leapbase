exports.setting = {
  // web
  name: 'Leapbase',
  http_port: 8060,
  webserver_baseurl: 'http://localhost:8060',
  // invite code
  invite_code_user: 'hello101test',
  invite_code_admin: 'world101test',
  // user authentication
  user_module: 'user',
  ssl: {
    enable: false,
    http_redirect: false
  },
  // database
  database: {
    type: 'mongo',
    port: 27017,
    host: 'localhost',
    name: 'leapbase'
  }
};
