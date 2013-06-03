// Simple reflector API to use for testing.

exports.name = "reflect";
/**
Reflection class for testing purposes.

@class reflect
**/
exports.remote = [ 
	{
		name: 'get.json', 
		method: 'get', 
		/**
		Reflection handler for HTTP GET get.json.

		@method get.json
		@param various {Any} Any number of parameters that will be reflected to the user.
		@return {Object} JSON object containing the parameters passed in.
		@example
			http://noblecall.orthlieb.com/api/reflect/get.json/?foo=bar&baz=quum
		@example 
			{
				"foo": "bar",
				"baz": "quum"
			}
		**/
		handler: function (req, res) {
			console.log('GET REFLECTED: ' + JSON.stringify(req.query));
			res.json(200, req.query);
		}
	}, {
		name: 'put.json', 
		method: 'put', 
		/**
		Reflection handler for HTTP PUT put.json.

		@method put.json
		@param body {Various} Body can contain any valid JSON data.
		@return {Object} JSON object containing the body passed in.
		@example
			http://noblecall.orthlieb.com/api/reflect/put.json
			body: {
				"foo": "bar",
				"baz": "quum"
			}
		@example 
			{
				"foo": "bar",
				"baz": "quum"
			}
		**/
		handler: function (req, res) {
			console.log('PUT REFLECTED: ' + JSON.stringify(req.body));
			res.json(200, req.body);
		}
	}, {
		name: 'post.json', 
		method: 'post', 
		/**
		Reflection handler for HTTP POST post.json.

		@method post.json
		@param body {Various} Body can contain any valid JSON data.
		@return {Object} JSON object containing the body passed in.
		@example
			http://noblecall.orthlieb.com/api/reflect/post.json
			body: {
				"foo": "bar",
				"baz": "quum"
			}
		@example 
			{
				"foo": "bar",
				"baz": "quum"
			}
		**/
		handler: function (req, res) {
			console.log('POST REFLECTED: ' + JSON.stringify(req.body));
			res.json(200, req.body);
		}
	}, {
		name: 'delete.json', 
		method: 'delete', 
		/**
		Reflection handler for HTTP DELETE delete.json.

		@method delete.json
		@param various {Any} Any number of parameters that will be reflected to the user.
		@return {Object} JSON object containing the parameters passed in.
		@example
			http://noblecall.orthlieb.com/api/reflect/delete.json/?foo=bar&baz=quum
		@example 
			{
				"foo": "bar",
				"baz": "quum"
			}
		**/
		handler: function (req, res) {
			console.log('DELETE REFLECTED: ' + JSON.stringify(req.query));
			res.json(200, req.query);
		}
	}
];


