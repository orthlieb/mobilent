var _ = require("../vendor/underscore-min");

var db = require('../modules/database-manager').db;
var accounts = db.collection('accounts');

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
	get: getUsers,
};

exports.remote = {
	get: function (req, res) {
		console.log("REMOTE API users.get {" + JSON.stringify(req.param) + "}");

		getUsers(function(error, accounts) {
			if (!error) {
				res.json(200, accounts);
			} else {
				res.error(error);
			}
		});
	}
};


