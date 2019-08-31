exports.setting = {
  // web
  name: 'Leapbase',
  http_port: 8060,
  // https_port: 8443,
  webserver_baseurl: 'http://localhost:8060',
  // invite code
  invite_code_user: 'hello101test',
  invite_code_admin: 'world101test',
  // user authentication
  user_module: 'user', // user/member
  // show_user_dropdown: false, // set to true if user module is loaded
  ssl: {
    enable: false,
    http_redirect: false
    // cert_file: './data/sslcert/fullchain.pem',
    // key_file: './data/sslcert/privkey.pem'
  },
  // database
  database: {
    type: 'mongo',
    port: 27017,
    host: 'localhost',
    name: 'leapbase'
  }
};
