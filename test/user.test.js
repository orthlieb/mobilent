var suite = 'USER';

// Required modules
var http = require('http');
var _ = require('./vendor/underscore-min');
var th = require("./lib/test_helper");

// The tests proper
var tests = [
	function (beforeExit, assert, callback) {
		// Put missing params
		var name = 'PUT (missing params)';
		var data = { };
		th.log(suite, name, 'STARTING', true);
		th.put(suite, 'user/create.json', data, function(res, body) {
			body = JSON.parse(body);
			assert.equal(400, res.statusCode);
			assert.equal(body.error, 'missing-parameter user: false email: false pass: false');
			th.log(suite, name, 'SUCCESS');
			callback();
		})
	},
	
	function (beforeExit, assert, callback) {
		// Put 201 success
		var name = 'PUT (201 success)';
		var path = 'user/create.json';
		var data = { 
			user: 'test',
			email: 'test@test.com',
			company: 'Testers Testco, Inc.',
			country: 'Testlandia',
			pass: 'password'
		};
		th.log(suite, name, 'STARTING', true);
		th.put(suite, path, data, function(res, body) {
			body = JSON.parse(body);
			assert.equal(201, res.statusCode);
			th.log(suite, name, 'SUCCESS', true);
			callback();
		});
	},
	
	function (beforeExit, assert, callback) {	
		// Put fail 400 duplicate user name
		var name = 'PUT (fail 400 duplicate user name)';
		var path = 'user/create.json';
		var data = { 
			user: 'test',
			email: 'test@test.com',
			pass: 'password'
		};
		th.log(suite, name, 'STARTING', true);
		th.put(suite, path, data, function(res, body) {
			body = JSON.parse(body);
			assert.equal(400, res.statusCode);
			th.log(suite, name, 'SUCCESS', true);
			callback();
		});
	},
	
	function (beforeExit, assert, callback) {	
		// Put New user name fail 400 duplicate email
		var name = 'PUT (New user name fail 400 duplicate email)';
		var path = 'user/create.json';
		var data = { 
			user: 'test2',
			email: 'test@test.com',
			pass: 'password'
		};
		th.log(suite, name, 'STARTING', true);
		th.put(suite, path, data, function(res, body) {
			body = JSON.parse(body);
			assert.equal(400, res.statusCode);
			th.log(suite, name, 'SUCCESS', true);
			callback();
		});
	},
	
	function (beforeExit, assert, callback) {	
		// Get missing parameters conditions
		var name = 'GET (missing params)';
		var path = 'user/read.json';
		th.log(suite, name, 'STARTING', true);
		th.get(suite, path, function(res, body) {
        	assert.equal(404, res.statusCode);
			th.log(suite, name, 'SUCCESS', true);
			callback();
		});
	},

	function (beforeExit, assert, callback) {	
		// Get 200 success and verify create
		var name = 'GET (200 success and verify create)';
		var path = 'user/read.json?user=test';
		var data = { 
			user: 'test',
			email: 'test@test.com',
			company: 'Testers Testco, Inc.',
			country: 'Testlandia',
			pass: 'password'
		};		
		th.log(suite, name, 'STARTING', true);
		th.get(suite, path, function(res, body) {
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
			th.log(suite, name, 'SUCCESS', true);
			callback();
		});
	},

	function (beforeExit, assert, callback) {
		// Get manual login
		var name = 'POST (manual login)';
		var path = 'user/login.json';
		var data = {
			user: 'test',
			pass: 'password'
		};
		th.log(suite, name, 'STARTING', true);
		th.post(suite, path, data, function(res, body) {
        	assert.equal(200, res.statusCode);
			th.log(suite, name, 'SUCCESS', true);
			callback();
		});
	},

	function (beforeExit, assert, callback) {
		// Post missing params
		var name = 'POST (missing params)';
		var path = 'user/update.json';
		var data = {};
		th.log(suite, name, 'STARTING', true);
		th.post(suite, path, data, function(res, body) {
			body = JSON.parse(body);
			assert.equal(400, res.statusCode);
			th.log(suite, name, 'SUCCESS', true);
			callback();
		});
	},
	
	function (beforeExit, assert, callback) {
		// Post 200 successful
		var name = 'POST (200 success)';
		var path = 'user/update.json';
		var data = {
			user: 'test',
			company: 'MobilEnt, Inc.'
		};
		th.log(suite, name, 'STARTING', true);
		th.post(suite, path, data, function(res, body) {
			body = JSON.parse(body);
			assert.equal(200, res.statusCode);
			th.log(suite, name, 'SUCCESS', true);
			callback();
		});
	},
	
	function (beforeExit, assert, callback) {	
		// Get 200 success and validate company update
		var name = 'GET (200 success and validate company update)';
		var path = 'user/read.json?user=test';
		var data = { 
			company: 'MobilEnt, Inc.',
		};		
		th.log(suite, name, 'STARTING', true);
		th.get(suite, path, function(res, body) {
        	assert.isNotNull(body);
        	var body = JSON.parse(body);
        	assert.isNotNull(body);
        	
        	// Compare the user values that was updated.
        	assert.equal(body.company, data.company);
			th.log(suite, name, 'SUCCESS', true);
			callback();
		});
	},

	function (beforeExit, assert, callback) {
		// Delete missing params
		var name = 'DELETE (missing params)';
		var path = 'user/delete.json';
		th.log(suite, name, 'STARTING', true);
		th.delete(suite, path, function(res, body) {
			assert.equal(400, res.statusCode);
			th.log(suite, name, 'SUCCESS', true);
			callback();
		});
	},

	function (beforeExit, assert, callback) {
		// Delete 200 success
		var name = 'DELETE (200 success)';
		var path = 'user/delete.json?user=test';
		th.log(suite, name, 'STARTING', true);
		th.delete(suite, path, function(res, body) {
			body = JSON.parse(body);
			assert.equal(200, res.statusCode);
			th.log(suite, name, 'SUCCESS', true);
			callback();
		});
	},

	function (beforeExit, assert, callback) {	
		// Get 404 cannot find deleted user
		var name = 'GET (404 cannot find deleted user)';
		var path = 'user/read.json?user=test';
		th.log(suite, name, 'STARTING', true);
		th.get(suite, path, function(res, body) {
        	assert.equal(404, res.statusCode);
			th.log(suite, name, 'SUCCESS', true);
			callback();
		});
	},
];

exports[suite] = function(beforeExit, assert) {
	// Execute the tests synchronously.
	th.log(suite, 'suite', 'Total of ' + tests.length + ' sub-tests', true);
	var testCase = tests.shift();
	testCase(beforeExit, assert, function callChain() {
		if (tests.length > 0) {
			testCase = tests.shift();
			testCase && testCase(beforeExit, assert, callChain);
		}
	});
};
