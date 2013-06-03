/**
Users class: represents all users of the MobilEnt instance.

@class users
**/

var _ = require("../vendor/underscore-min");

var db = require('../modules/database-manager').db;
var accounts = db.collection('accounts');

/**
Gets all users. Has both a local (api.users.get) and a remote (api/users/read.json) version.

@method read
@return {Array} JSON object containing the user records with user id, name, email, company, country, created, modified, and _id.
@example
	GET http://mobilent.com/api/users/read.json
@example 
	Returns:
	[
		{
			"user": "gollum",
			"name": "Gollum Smeagol",
			"email": "gollum@mordor.com",
			"company": "Independent Agent",
			"country": "Mordor",
			"created": "20130520142109-07:00",
			"modified": "20130520142226-07:00",
			"_id": "519a93c5da78cdb4a5000001"
		},
		{
			"user": "frodo",
			"name": "Frodo Baggins",
			"email": "frodo@baggins.com",
			"company": "Underhill Inc.",
			"country": "The Shire",
			"created": "20130521152255-07:00",
			"modified": "20130521160842-07:00",
			"_id": "519bf3bf3cac4d66b8000001"
		}
	]
**/
function getUsers(callback) {
	console.log("LOCAL API getUsers");
	accounts.find().toArray(function(error, data) {
		for (var i = 0; i < data.length; i++) {
			data[i] = _.omit(data[i], [ "pass" ]);
		}
		callback(error, data);
	});
}

exports.name = "users";


exports.local = {
	read: getUsers,
};

exports.remote = [
	{
		name: 'read.json', 
		method: 'get', 
		handler: function (req, res) {
			console.log("REMOTE API users.get {" + JSON.stringify(req.param) + "}");

			getUsers(function(error, accounts) {
				if (!error) {
					res.json(200, accounts);
				} else {
					res.error(error);
				}
			});
		}
	}
];


