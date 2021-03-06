
/**
	* Adapted from node-login boilerplate by Stephen Braitsch (http://bit.ly/LsODY8)
**/

var express = require('express');
var http = require('http');
var app = express();

app.configure(function(){
	app.set('port', 8080);
	app.set('views', __dirname + '/app/server/views');
	app.set('view engine', 'jade');
	app.locals.pretty = true;
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'mobilent-secret' }));
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
	app.use(express.static(__dirname + '/app/public'));
	app.use(express.favicon(__dirname + '/app/public/img/favicon.ico'));
});

// app.configure('development', function(){
// 	app.use(express.errorHandler());
// });

require('./app/server/router')(app);


app.use(function(err, req, res, next){
debugger;
	console.error(err);
	res.send(err.status, err); // err.status, err);
});

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
})