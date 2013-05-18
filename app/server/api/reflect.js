// Simple reflector API to use for testing.

exports.name = "reflect";
exports.remote = [ 
	{
		name: 'get.json', 
		method: 'get', 
		handler: function (req, res) {
			console.log('GET REFLECTED: ' + JSON.stringify(req.query));
			res.json(200, req.query);
		}
	}, {
		name: 'put.json', 
		method: 'put', 
		handler: function (req, res) {
			console.log('PUT REFLECTED: ' + JSON.stringify(req.body));
			res.json(200, req.body);
		}
	}, {
		name: 'post.json', 
		method: 'post', 
		handler: function (req, res) {
			console.log('POST REFLECTED: ' + JSON.stringify(req.body));
			res.json(200, req.body);
		}
	}, {
		name: 'delete.json', 
		method: 'delete', 
		handler: function (req, res) {
			console.log('DELETE REFLECTED: ' + JSON.stringify(req.query));
			res.json(200, req.query);
		}
	}
];


