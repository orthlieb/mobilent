var reflect = require('./api/reflect');
var users = require('./api/users');
var user = require('./api/user');
var _ = require('./vendor/underscore-min');

exports.remote = {};
exports.remote[reflect.name] = reflect.remote;	// For testing.
exports.remote[users.name] = users.remote;
exports.remote[user.name] = user.remote;

exports.local = {};
exports.local[users.name] = users.local;
exports.local[user.name] = user.local;

