var httpProxy = require('http-proxy'),
  connect = require('connect'),
  http      = require('http'),
  url       = require('url');

// Website to redirect
SOURCE        = 'localhost.dev:5000';
TARGET        = 'http://www.decathlon.fr';
PARSED_TARGET = url.parse(TARGET);
PORT          = 5000;

// Basic Connect App
var app = connect();
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
app.use(function(req, res, next) {
  req.headers['host']   = PARSED_TARGET.host;
  req.headers['origin'] = TARGET;
  next();
});

var transforms = {
  'text/html': require('./app/parsers').html,
  'application/javascript': require('./app/parsers').javascript
};

app.use(require('./app/tool/transform')(transforms));

app.use(function(req, res) {
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

http.createServer(app).listen(PORT);
console.log('Server started at port ' + PORT);
