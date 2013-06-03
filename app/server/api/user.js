/**
User class: represents a users of the MobilEnt instance.

@class user
**/

var _ = require("../vendor/underscore-min");
var crypto = require('crypto');
var moment = require('moment');

var db = require('../modules/database-manager').db;
var accounts = db.collection('accounts');
var fields = {
	read: [ "user", "name", "email", "company", "country", "created", "modified" ],
	create: [ "user", "name", "email", "company", "country", "pass" ],
	update: [ "user", "name", "email", "company", "country", "pass" ]
};

// Private encryption & validation methods

function generateSalt()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	
	return salt;
}

function md5(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

function saltAndHash(pass, callback)
{
	var salt = generateSalt();
	return salt + md5(pass + salt);
}

var validatePassword = function(plainPass, hashedPass)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	
	return hashedPass === validHash;
}

var getObjectId = function(id)
{
	return accounts.db.bson_serializer.ObjectID.createFromHexString(id)
}

// Routable methods 

function autoLogin(user, pass, callback)
{
	accounts.findOne({ user: user }, function(e, o) {
		callback(o && o.pass == pass ? o : null);
	});
}

/**
Logins in a user into the MobilEnt system. Has both a local (api.user.login) and a remote (api/user/login.json) version.

Executes the supplied callback when the user has been logged in, passing a null error obect and the user object. 
The user object is a JSON object containing the user record with user id, name, email, company, country, created, modified, and _id.

On error, the callback error is non-null and contains one of the following 
	'user-not-found'   (404)
	'invalid-password' (400)
@method login
@example
	POST http://mobilent.com/api/users/login.json
@example
	Body:
	{
		"user": "gollum",
		"pass": "precious"
	}
@example
	api.user.login({ user: "gollum", pass: "precious" });
@example 
	Returns:
	{
		"user": "gollum",
		"name": "Gollum Smeagol",
		"email": "gollum@mordor.com",
		"company": "Independent Agent",
		"country": "Mordor",
		"created": "20130520142109-07:00",
		"modified": "20130520142226-07:00",
		"_id": "519a93c5da78cdb4a5000001"
	}
**/
function loginUser(data, callback)
{
	accounts.findOne({ user: data.user }, function(e, o) {
		if (!o) {
			callback('user-not-found');
		} else {
			if (validatePassword(data.pass, o.pass)) {
				callback(null, o);
			} else {
				callback('invalid-password');
			}
		}
	});
}

function validateResetLink(email, passHash, callback)
{
	accounts.find({ email: email, pass: passHash }, function(e, o) {
		callback(!!o);
	});
}

/**
Retrieves a user record from the MobilEnt system.

Executes the supplied callback when the user located, passing a null error object and the user object. 
The user object is a JSON object containing the user record with user id, name, email, company, country, created, modified, and _id.

On error, the callback error is non-null and contains one of the following 
	'missing-parameter' (400)
	'user-not-found' (404)
@method read
@param conditions {Object} List of conditions to use to search for the user.
@example
	GET http://mobilent.com/api/user/read.json?user=gollum
@example
	api.user.read({ user: "gollum" }, function (err, obj) { alert(JSON.stringify(err ? err : obj)) });
@example 
	Returns:
	{
		"user": "gollum",
		"name": "Gollum Smeagol",
		"email": "gollum@mordor.com",
		"company": "Independent Agent",
		"country": "Mordor",
		"created": "20130520142109-07:00",
		"modified": "20130520142226-07:00",
		"_id": "519a93c5da78cdb4a5000001"
	}
**/
function readUser(conditions, callback) {
	console.log("LOCAL API readUser: " + JSON.stringify(conditions));
	if (!conditions || _.keys(conditions).length == 0)
		callback('missing-parameter conditions: false');

	accounts.findOne(conditions, callback);
}

/**
Creates a new user record in the MobilEnt system.

Executes the supplied callback when the user is created, passing a null error object and the user object. 
The user object is a JSON object containing the user record with user id, name, email, company, country, created, modified, and _id.

On error, the callback error is non-null and contains one of the following 
	'missing-parameter' (400)
	'username-taken' (400)
	'email-taken' (400)
	'insert-error' (400)
@method create
@param data {Object} User record to create. Note that at a minimum you must supply a user name, email, and password at a minimum.
@example
	PUT http://mobilent.com/api/user/create.json
@example
	Body:
	{
		"user": "gollum",
		"email": "gollum@mordor.com",
		"pass": "precious"
	}
@example
	api.user.create({ user: "gollum", email: "gollum@mordor.com", pass: "precious" }, 
		function (err, obj) { alert(JSON.stringify(err ? err : obj)) });
@example 
	Returns:
	{
		"user": "gollum",
		"name": "Gollum Smeagol",
		"email": "gollum@mordor.com",
		"company": "Independent Agent",
		"country": "Mordor",
		"created": "20130520142109-07:00",
		"modified": "20130520142226-07:00",
		"_id": "519a93c5da78cdb4a5000001"
	}
**/
function createUser(data, callback) {
	console.log("LOCAL API createUser: " + JSON.stringify(data));
	data = _.pick(data, fields.create);
	if (!data || !data.user || !data.email || !data.pass) {
		callback('missing-parameter user: ' + !!(data.user) + " email: " + !!(data.email) + " pass: " + !!(data.pass));
		return;
	}
		
	accounts.findOne({ user: data.user }, function(e, o) {
		if (o) {	// User names must be unique
			callback('username-taken');
			return;
		}

		accounts.findOne({ email: data.email }, function(e, o) {
			if (o) {
				callback('email-taken');	// Email addresses must be unique
				return;
			}
			
			data.pass = saltAndHash(data.pass);					

			// Append date stamp when record was created.
			var stamp = moment().format('YYYYMMDDHHmmssZ');
			data.created = stamp;
			data.modified = stamp;
			
			accounts.save(data, {safe: true}, function (err) {
				if (err)
					callback('insert-error');
				else
					callback(false, data);
			});
		});
	});
}

/**
Updates an existing user or creates a new user record in the MobilEnt system.

Executes the supplied callback when the user is created, passing a null error object and the user object. 
The user object is a JSON object containing the user record with user id, name, email, company, country, created, modified, and _id.

On error, the callback error is non-null and contains one of the following 
	'missing-parameter' (400)
	'save-error' (400)
@method update
@param data {Object} User record to update. Note that you must supply a user name in order to locate at least one user. 
	If you are creating a user, you must supply a user id, email, and password at a minimum.
@example
	POST http://mobilent.com/api/user/update.json
@example
	Body:
	{
		"user": "gollum",
		"country": "Mordor",
		"company": "Mordor Inc."
	}
@example
	api.user.update({ user: "gollum", country: "Mordor", company: "Mordor Inc." },
		function (err, obj) { alert(JSON.stringify(err ? err : obj)) });
@example 
	Returns:
	{
		"user": "gollum",
		"name": "Gollum Smeagol",
		"email": "gollum@mordor.com",
		"company": "Independent Agent",
		"country": "Mordor",
		"created": "20130520142109-07:00",
		"modified": "20130520142226-07:34",
		"_id": "519a93c5da78cdb4a5000001"
	}
**/
function updateUser(data, callback) {
	console.log("LOCAL API updateUser: " + JSON.stringify(data));
	data = _.pick(data, fields.update);
	if (!data || !data.user) {
		callback('missing-parameter user: ' + !!(data.user));
		return;
	}
		
	accounts.findOne({ user: data.user }, function(e, o) {
		if (!o) {
			createUser(data, callback);
			return;
		}
	
		// Apply the data to our object.
		_.extend(o, data);
		if (data.pass)		// Update password as well.
			o.pass = saltAndHash(data.pass);
		else
			delete o.pass;	// Make sure it doesn't get updated to null!
			
		// Append date stamp when the record was modified.	
		o.modified = moment().format('YYYYMMDDHHmmssZ');
	
		accounts.save(o, {safe: true}, function (err, numberAffected, rawResponse) {
			if (err)
				callback('save-error');
			else
				callback(false, o);
		});
	});
}

/**
Deletes an existing user in the MobilEnt system.

Executes the supplied callback when the user is deleted, passing a null error object and the user object. 
The user object is a JSON object containing the user record with user id, name, email, company, country, created, modified, and _id.

On error, the callback error is non-null and contains one of the following 
	'missing-parameter' (400)
	'delete-error' (400)
@method delete
@param data {Object} User record to delete. Note that you must supply suffient conditions to locate at least one user. 
@example
	DELETE http://mobilent.com/api/user/delete.json
@example
	Body:
	{
		"user": "gollum",
	}
@example
	api.user.delete({ user: "gollum" },
		function (err, obj) { alert(JSON.stringify(err ? err : obj)) });
@example 
	Returns:
	{
		"user": "gollum",
		"name": "Gollum Smeagol",
		"email": "gollum@mordor.com",
		"company": "Independent Agent",
		"country": "Mordor",
		"created": "20130520142109-07:00",
		"modified": "20130520142226-07:00",
		"_id": "519a93c5da78cdb4a5000001"
	}
**/
function deleteUser(conditions, callback) {
	console.log("LOCAL API deleteUser: " + JSON.stringify(conditions));
	if (!conditions || _.keys(conditions).length == 0) {
		callback('missing-parameter conditions: false');
		return;
	}

	accounts.remove(conditions, function (err, numberAffected, rawResponse) {
		if (err)
			callback('delete-error');
		else
			callback(false, conditions);
	});
}

exports.name = "user";
exports.local = {
	read: readUser,
	create: createUser,
	update: updateUser,
	delete: deleteUser,
	autoLogin: autoLogin,
	login: loginUser,
	validateResetLink: validateResetLink
};

exports.remote = [
	{
		name: 'login.json', 
		method: 'post', 
		handler: function (req, res, next) {
			console.log("REMOTE API user.login " + JSON.stringify(req.body));
			loginUser(req.body, function(err, user) {
				if (!err) {
					res.json(200, user);	// Ok
				} else {
					next(new Error(err));
					// res.json(400, { error: err });
				}
			});
		}
	}, {
		name: 'read.json', 
		method: 'get', 
		handler: function (req, res) {
			console.log("REMOTE API user.read " + JSON.stringify(req.query));
			readUser(req.query, function(err, user) {
				if (!err && user) {
					res.json(200, user);	// Ok
				} else {
					res.json(404, { error: err });
				}
			});
		}
	}, {
		name: 'create.json', 
		method: 'put', 
		handler: function (req, res) {
			console.log("REMOTE API user.create " + JSON.stringify(req.body));
			createUser(req.body, function(err, user) {
				if (!err) {
					res.json(201, user);	// Created
				} else {
					res.json(400, { error: err });
				}
			});
		}
	}, {
		name: 'update.json', 
		method: 'post', 
		handler: function (req, res) {
			console.log("REMOTE API user.update " + JSON.stringify(req.body));
			updateUser(req.body, function(err, user) {
				if (!err) {
					res.json(200, user);	// Updated
				} else {
					res.json(400, { error: err });
				}
			});
		}
	}, {
		name: 'delete.json', 
		method: 'delete', 
		handler: function (req, res) {
			console.log("REMOTE API user.delete " + JSON.stringify(req.query));
			deleteUser(req.query, function (err, user) {
				if (!err) {
					res.json(200, user);	// Deleted
				} else {
					res.json(400, { error: err });
				}
			});
		}
	}
];


