var httpProxy = require('http-proxy'),
  connect = require('connect'),
  http = require('http'),
  url = require('url'),
  path = require('path'),
  config;

// Get config
if(process.argv[2]){
  config = require(path.resolve(process.argv[2]));
} else {
  config = require('./config');
}
config.parsed_target = url.parse(config.target);

// Basic Connect App
var app = connect();
// Initialize reverse proxy
var proxy = httpProxy.createProxyServer({
  secure: false
});

// Handle proxy response
proxy.on('proxyRes', function(proxyRes, req, res) {

  if (proxyRes.statusCode >= 301 && proxyRes.statusCode <= 302) {

    var location = proxyRes.headers['location'];
    var replaced = location.replace(config.parsed_target.host, config.source);

    proxyRes.headers['location'] = replaced;
  }
});

// Handle http requests
app.use(function(req, res, next) {
  req.headers['host'] = config.parsed_target.host;
  req.headers['origin'] = config.target;
  next();
});

var transforms = {
  'text/html': require('./app/parsers').html,
  'application/javascript': require('./app/parsers').javascript
};

app.use(require('./app/tool/transform')(config, transforms));

app.use(function(req, res) {
  proxy.web(req, res, {
    target: config.target
  });
});

// Handle errors
proxy.on('error', function(err, req, res) {

  // @todo: logs

  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('We are sorry, but we cannot serve this request.');
});

http.createServer(app).listen(config.port);
console.log('Server started at port ' + config.port);
