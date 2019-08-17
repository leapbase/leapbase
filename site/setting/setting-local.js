exports.setting = {
  // web
  name: 'Leapbase',
  http_port: 8060,
  https_port: 8443,
  webserver_baseurl: 'http://localhost:8060',
  // invite code
  invite_code_user: 'hello110street',
  invite_code_admin: 'world110street',
  // user authentication
  user_module: 'user', // user/member
  show_user_dropdown: false, // show user dropdown on right side of navbar or not
  ssl: {
    enable: false,
    http_redirect: false,
    cert_file: './data/sslcert/fullchain.pem',
    key_file: './data/sslcert/privkey.pem'
  },
  // database
  database: {
    type: 'mongo',
    port: 27017,
    host: 'localhost',
    name: 'leapbase'
  }
};
