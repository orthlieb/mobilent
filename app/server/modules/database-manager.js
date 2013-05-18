var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'mobilent';

/* Establish the database connection */
exports.db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
exports.db.open(function(e, d) {
	if (e) {
		console.log(e);
	} else {
		console.log('Connected to database: ' + dbName);
	}
});
