var httpProxy = require('http-proxy');
var http      = require('http');
var url       = require('url');

// Website to redirect
SOURCE        = 'localhost.dev:5000';
TARGET        = 'http://www.decathlon.fr';
PARSED_TARGET = url.parse(TARGET);
PORT          = 5000;

// Initialize reverse proxy
var proxy = httpProxy.createProxyServer({ secure: false });

// Handle proxy response
proxy.on('proxyRes', function (proxyRes, req, res) {

  if(proxyRes.statusCode >= 301 && proxyRes.statusCode <= 302){

    var location = proxyRes.headers['location'];
    var replaced = location.replace(PARSED_TARGET.host, SOURCE);

    proxyRes.headers['location'] = replaced;
  }
});

// Handle http requests
var server = http.createServer(function(req, res) {

  req.headers['host']   = PARSED_TARGET.host;
  req.headers['origin'] = TARGET;

  proxy.web(req, res, { target: TARGET });
});

// Handle errors
proxy.on('error', function (err, req, res) {

  // @todo: logs

  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('We are sorry, but we cannot serve this request.');
});

console.log('Listen on port ' + PORT);

server.listen(PORT);
