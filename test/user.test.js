var suite = 'USER';
var noisy = true;

var defaultOptions = {
	host: 'localhost',
	port: 8080,
	path: '/api/user',
	headers: {}
};	

// Required modules
var http = require('http');
var _ = require("./vendor/underscore-min");

// Helper functions
function log(name, msg, priority) {
	if (noisy || priority)
		console.log('Test ' + suite + ' ' + name + '=> ' + msg);
}

function logResponse(name, res, body) {
	if (noisy) {
		log(name, 'Status: ' + res.statusCode);
		log(name, 'Headers: ' + JSON.stringify(res.headers));
		body && log(name, "Body: " + body);
	}
}

function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function testGeneric(options, data, callback) {
	log('GENERIC', 'Options: ' + JSON.stringify(options) + '\nData: ' + JSON.stringify(data), true);
	var req = http.request(options, function(res) {	
		var body = '';
		res.on('data', function (chunk) {
    		body += chunk;
  		}).on('end', function() {
			logResponse(options.method, res, body);
			callback && callback(res, body);
 		}).on('error', function (e) {
 			callback && callback(res, e);
 		});
	});
	data && req.write(data);
	req.end();
}

function testPut(data, callback) {
	var d = JSON.stringify(data);
	var options = clone(defaultOptions);
	options.method = 'PUT';
	options.headers['Content-Length'] = d.length;
	options.headers['Content-Type'] = 'application/json';

	testGeneric(options, d, callback);
}

function testPost(data, callback) {
	var d = JSON.stringify(data);
	var options = clone(defaultOptions);
	options.method = 'POST';
	options.headers['Content-Length'] = d.length;
	options.headers['Content-Type'] = 'application/json';

	testGeneric(options, d, callback);
}

function testGet(path, callback) {
	var options = clone(defaultOptions);
	options.method = 'GET';
	options.path = path;

	testGeneric(options, null, callback);
}

function testDelete(path, callback) {
	var options = clone(defaultOptions);
	options.method = 'DELETE';
	options.path = path;

	testGeneric(options, null, callback);
}

// The tests proper
var tests = [
	function (beforeExit, assert, callback) {
		// Put missing params
		var name = 'PUT (missing params)';
		var data = { };
		log(name, 'STARTING', true);
		testPut(data, function(res, body) {
			body = JSON.parse(body);
			assert.equal(400, res.statusCode);
			assert.equal(body.error, 'missing-parameter user: false email: false pass: false');
			log(name, 'SUCCESS');
			callback();
		})
	},
	
	function (beforeExit, assert, callback) {
		// Put 201 success
		var name = 'PUT (201 success)';
		var data = { 
			user: 'test',
			email: 'test@test.com',
			company: 'Testers Testco, Inc.',
			country: 'Testlandia',
			pass: 'password'
		};
		log(name, 'STARTING', true);
		testPut(data, function(res, body) {
			body = JSON.parse(body);
			assert.equal(201, res.statusCode);
			log(name, 'SUCCESS', true);
			callback();
		});
	},
	
	function (beforeExit, assert, callback) {	
		// Put fail 400 duplicate user name
		var name = 'PUT (fail 400 duplicate user name)';
		var data = { 
			user: 'test',
			email: 'test@test.com',
			pass: 'password'
		};
		log(name, 'STARTING', true);
		testPut(data, function(res, body) {
			body = JSON.parse(body);
			assert.equal(400, res.statusCode);
			log(name, 'SUCCESS', true);
			callback();
		});
	},
	
	function (beforeExit, assert, callback) {	
		// Put New user name fail 400 duplicate email
		var name = 'PUT (New user name fail 400 duplicate email)';
		var data = { 
			user: 'test2',
			email: 'test@test.com',
			pass: 'password'
		};
		log(name, 'STARTING', true);
		testPut(data, function(res, body) {
			body = JSON.parse(body);
			assert.equal(400, res.statusCode);
			log(name, 'SUCCESS', true);
			callback();
		});
	},
	
	function (beforeExit, assert, callback) {	
		// Get missing parameters conditions
		var name = 'GET (missing params)';
		var path = '/api/user';
		log(name, 'STARTING', true);
		testGet(path, function(res, body) {
        	assert.equal(404, res.statusCode);
			log(name, 'SUCCESS', true);
			callback();
		});
	},

	function (beforeExit, assert, callback) {	
		// Get 200 success and verify create
		var name = 'GET (200 success and verify create)';
		var path = '/api/user?user=test';
		var data = { 
			user: 'test',
			email: 'test@test.com',
			company: 'Testers Testco, Inc.',
			country: 'Testlandia',
			pass: 'password'
		};		
		log(name, 'STARTING', true);
		testGet(path, function(res, body) {
        	assert.isNotNull(body);
        	var body = JSON.parse(body);
        	assert.isNotNull(body);
        	
        	// Compare the user values that we previously wrote.
        	_.each(data, function(value, key, list) {
        		if (key != "pass")
	        		assert.equal(body[key], value);
	        	else 	// Password should have been hashed!
	        		assert.notEqual(body[key], value);
        	}); 
			log(name, 'SUCCESS', true);
			callback();
		});
	},

	function (beforeExit, assert, callback) {
		// Post missing params
		var name = 'POST (missing params)';
		var data = {};
		log(name, 'STARTING', true);
		testPost(data, function(res, body) {
			body = JSON.parse(body);
			assert.equal(400, res.statusCode);
			log(name, 'SUCCESS', true);
			callback();
		});
	},
	
	function (beforeExit, assert, callback) {
		// Post 200 successful
		var name = 'POST (200 success)';
		var data = {
			user: 'test',
			company: 'MobilEnt, Inc.'
		};
		log(name, 'STARTING', true);
		testPost(data, function(res, body) {
			body = JSON.parse(body);
			assert.equal(200, res.statusCode);
			log(name, 'SUCCESS', true);
			callback();
		});
	},
	
	function (beforeExit, assert, callback) {	
		// Get missing parameters conditions
		var name = 'GET (200 success and validate company update)';
		var path = '/api/user?user=test';
		var data = { 
			company: 'MobilEnt, Inc.',
		};		
		log(name, 'STARTING', true);
		testGet(path, function(res, body) {
        	assert.isNotNull(body);
        	var body = JSON.parse(body);
        	assert.isNotNull(body);
        	
        	// Compare the user values that was updated.
        	assert.equal(body.company, data.company);
			log(name, 'SUCCESS', true);
			callback();
		});
	},

	function (beforeExit, assert, callback) {
		// Delete missing params
		var name = 'DELETE (missing params)';
		var path = '/api/user';
		log(name, 'STARTING', true);
		testDelete(path, function(res, body) {
			assert.equal(400, res.statusCode);
			log(name, 'SUCCESS', true);
			callback();
		});
	},

	function (beforeExit, assert, callback) {
		// Delete 200 success
		var name = 'DELETE (200 success)';
		var path = '/api/user?user=test';
		log(name, 'STARTING', true);
		testDelete(path, function(res, body) {
			body = JSON.parse(body);
			assert.equal(200, res.statusCode);
			log(name, 'SUCCESS', true);
			callback();
		});
	},

	function (beforeExit, assert, callback) {	
		// Get 404 cannot find deleted user
		var name = 'GET (404 cannot find deleted user)';
		var path = '/api/user?user=test';
		log(name, 'STARTING', true);
		testGet(path, function(res, body) {
        	assert.equal(404, res.statusCode);
			log(name, 'SUCCESS', true);
			callback();
		});
	},

];

exports[suite] = function(beforeExit, assert) {
	// Execute the tests synchronously.
	log('suite', 'Total of ' + tests.length + ' sub-tests', true);
	var testCase = tests.shift();
	testCase(beforeExit, assert, function callChain() {
		if (tests.length > 0) {
			testCase = tests.shift();
			testCase && testCase(beforeExit, assert, callChain);
		}
	});
};
