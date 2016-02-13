var httpProxy = require('http-proxy');
var http      = require('http');

// Website to redirect
TARGET = 'b4wedding.fr';

// Create proxy server
var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function(req, res) {

  req.headers['host'] = TARGET;

  console.log(res.getHeader('Host'));

  proxy.web(req, res, { target: 'https://' + TARGET });
});

server.listen(5000);
