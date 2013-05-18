// Simple reflector API to use for testing.

exports.name = "reflect";
exports.remote = {
	get: function (req, res) {
		console.log('GET REFLECTED: ' + JSON.stringify(req.query));
		res.json(200, req.query);
	},
	put: function (req, res) {	// Create or update
	  console.log('PUT REFLECTED: ' + JSON.stringify(req.body));
	  res.json(200, req.body);
	},
	post: function (req, res) {	// Create
	  console.log('POST REFLECTED: ' + JSON.stringify(req.body));
	  res.json(200, req.body);
	},
	delete: function (req, res) { 
	  console.log('DELETE REFLECTED: ' + JSON.stringify(req.query));
	  res.json(200, req.query);
	}
};


