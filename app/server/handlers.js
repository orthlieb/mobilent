var reflect = require('./api/reflect');
var users = require('./api/users');
var user = require('./api/user');
var _ = require('./vendor/underscore-min');

exports.remote = [ reflect.remote, users.remote, user.remote ];
exports.local = [ users.local, user.local ];

