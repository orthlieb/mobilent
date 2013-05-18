
var CT = require('./modules/country-list');
var EM = require('./modules/email-dispatcher');
var _ = require('./vendor/underscore-min');


var handlers = [
	require('./api/reflect'),
	require('./api/users'),
	require('./api/user')
];

var api = {};
for (var i = 0; i < handlers.length; i++) {
	api[handlers[i].name] = handlers[i].local;
}

module.exports = function(app) {
	// Create the remote API handlers with the corresponding paths and methods.
	debugger;
	console.log("ROUTER: Creating remote handlers");
	for (var i = 0; i < handlers.length; i++) {
		var name = handlers[i].name;	// E.g. user
		var remote = handlers[i].remote;	// Array
		for (var j = 0; j < remote.length; j++) {
			var path = '/api/' + name + '/' + remote[j].name;
			var method = remote[j].method;	
			console.log("ROUTER: registering " + method + ": " + path);
			app[method](path, remote[j].handler);
		}
	}		

	app.get('/', function(req, res){
		console.log("GET / {" + JSON.stringify(req.param) + "}");
		// Check if the user's credentials are saved in a cookie.
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		} else {
			// Attempt automatic login.
			api.user.autoLogin(req.cookies.user, req.cookies.pass, function(o) {
				if (o) {
				    req.session.user = o;
					res.redirect('/home');
				} else {
					res.render('login', { title: 'Please Login To Your Account' });
				}
			});
		}
	});
	
	app.post('/', function(req, res) {
		// Manual login.
		console.log("POST / {" + JSON.stringify(req.param) + "}");
		api.user.manualLogin(req.param('user'), req.param('pass'), function(e, o) {
			if (!o) {
				res.send(e, 400);
			} else {
			    req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.redirect('/home');
//				res.send(o, 200);
			}
		});
	});
	
// logged-in user homepage //
	
	app.get('/home', function(req, res) {
		console.log("GET home {" + JSON.stringify(req.param) + "}");
	    if (req.session.user == null){
			// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    } else {
			res.render('home', {
				title : 'User Profile',
				countries : CT,
				udata : req.session.user
			});
	    }
	});
	
	app.post('/home', function(req, res){
		if (req.param('user') != undefined) {
			api.user.post({
				user 		: req.param('user'),
				name 		: req.param('name'),
				company 	: req.param('company'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(e, o) {
				if (e) {
					res.send('error-updating-account', 400);
				} else {
					req.session.user = o;
					// update the user's login cookies if they exist //
					if (req.cookies.user != undefined && req.cookies.pass != undefined) {
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}
			});
		} else if (req.param('logout') == 'true') {
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e) { res.send('ok', 200); });
		}
	});
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		console.log("GET signup {" + JSON.stringify(req.param) + "}");
		res.render('signup', {  title: 'Signup', countries : CT });
	});
	
	app.post('/signup', function(req, res){
		console.log("POST signup {" + JSON.stringify(req.param) + "}");
		api.user.put({
			name 	: req.param('name'),
			email 	: req.param('email'),
			user 	: req.param('user'),
			pass	: req.param('pass'),
			country : req.param('country')
		}, function(e){
			if (e){
				res.send(e, 400);
			} else {
				res.send('ok', 200);
			}
		});
	});

// password reset //

	app.post('/lost-password', function(req, res){
		console.log("POST lost-password {" + JSON.stringify(req.param) + "}");
	// look up the user's account via their email //
		api.user.get({ email: req.param('email') }, function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					} else {
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			} else {
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		console.log("GET reset-password {" + JSON.stringify(req.param) + "}");
		var email = req.query["e"];
		var passH = req.query["p"];
		api.user.validateResetLink(email, passH, function(e) {
			if (e) {
				res.redirect('/');
			} else {
				// Save the user's email in a session instead of sending to the client
				req.session.reset = { email: email, passHash: passH };
				res.render('reset', { title: 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		console.log("POST reset-password {" + JSON.stringify(req.param) + "}");
		var pass = req.param('pass');
		// Retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
		// Destroy the session immediately after retrieving the stored email //
		req.session.destroy();
		api.user.post({ email: email, pass: pass }, function(e, o) {
			if (o) {
				res.send('ok', 200);
			} else {
				res.send('Unable to update password', 400);
			}
		});
	});

// Get accounts

	app.get('/users', function(req, res) {
		console.log("UI GET users {" + JSON.stringify(req.param) + "}");
		api.users.get(function (error, data) {
			res.render('print', { title : 'Account List', accts : data });
		});		
	});
		
// view & delete accounts //
	
	app.post('/delete', function(req, res){
		console.log("POST delete {" + JSON.stringify(req.param) + "}");
		api.user.delete(req.body.id, function(e, obj) {
			if (!e) {
				res.clearCookie('user');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			} else {
				res.send('record not found', 400);
			}
	    });
	});
	
	app.get('*', function(req, res) { 
		console.log("GET all-others {" + JSON.stringify(req.param) + "}");
		res.render('error', { 
			title: 'Page Not Found', 
			number: 404, 
			message: 'Resource not found perhaps the MobileEnt Monsters ate it. Also: check your URL, it might be mangled.'
		}); 
	});

};