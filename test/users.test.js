var suite = 'USERS';
var noisy = true;

// Required modules
console.log('*************' + JSON.stringify(th));
var th = require("./lib/test_helper");
console.log('*************' + JSON.stringify(th.log));

// The tests proper
var tests = [
	function (beforeExit, assert, callback) {
		// Get missing params
		var name = 'GET (missing params)';
		var data = { };
		th.log(suite, name, 'STARTING', true);
		th.get(suite, 'users/read.json', function(res, body) {
			body = JSON.parse(body);
			assert.equal(200, res.statusCode);
			th.log(suite, name, 'SUCCESS');
			callback();
		})
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
