var http = require('http');

function handleRequest(req, res){
	res.writeHead(200, {'Content-Type' : 'text/plain'});
	res.end("Hello!");
}

var server = http.createServer(handleRequest).listen(3000,'127.0.0.1');

module.exports = server;