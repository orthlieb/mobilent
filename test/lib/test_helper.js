var noisy = false;

var defaultOptions = {
	host: 'localhost',
	port: 8080,
	path: '/api/',
	headers: {}
};	

// Required modules
var http = require('http');

// Helper functions
function log(suite, name, msg, priority) {
	if (noisy || priority)
		console.log('Test ' + suite + ' ' + name + '=> ' + msg);
}

function logResponse(suite, name, res, body) {
	if (noisy) {
		log(suite, name, 'Status: ' + res.statusCode);
		log(suite, name, 'Headers: ' + JSON.stringify(res.headers));
		body && log(suite, name, "Body: " + body);
	}
}

function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function testGeneric(suite, options, data, callback) {
	log(suite, 'http.request', 'Options: ' + JSON.stringify(options) + '\nData: ' + JSON.stringify(data), true);
	var req = http.request(options, function(res) {	
		var body = '';
		res.on('data', function (chunk) {
    		body += chunk;
  		}).on('end', function() {
			logResponse(suite, options.method, res, body);
			callback && callback(res, body);
 		}).on('error', function (e) {
 			callback && callback(res, e);
 		});
	});
	data && req.write(data);
	req.end();
}

exports.put = function testPut(suite, path, data, callback) {
	var d = JSON.stringify(data);
	var options = clone(defaultOptions);
	options.method = 'PUT';
	options.path += path;
	options.headers['Content-Length'] = d.length;
	options.headers['Content-Type'] = 'application/json';

	testGeneric(suite, options, d, callback);
};

exports.post = function testPost(suite, path, data, callback) {
	var d = JSON.stringify(data);
	var options = clone(defaultOptions);
	options.method = 'POST';
	options.path += path;
	options.headers['Content-Length'] = d.length;
	options.headers['Content-Type'] = 'application/json';

	testGeneric(suite, options, d, callback);
};

exports.get = function testGet(suite, path, callback) {
	var options = clone(defaultOptions);
	options.method = 'GET';
	options.path += path;

	testGeneric(suite, options, null, callback);
};

exports['delete'] = function testDelete(suite, path, callback) {
	var options = clone(defaultOptions);
	options.method = 'DELETE';
	options.path += path;

	testGeneric(suite, options, null, callback);
};

exports.log = log;
exports.logResponse = logResponse;
