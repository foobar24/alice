var httpProxy = require('http-proxy'),
  connect = require('connect'),
  http = require('http'),
  url = require('url'),
  path = require('path'),
  fs = require('fs'),
  morgan = require('morgan'),
  config = require('./app/config');

// Basic Connect App
var app = connect();

// Initialize reverse proxy
var proxy = httpProxy.createProxyServer({
  secure: false
});

// Handle proxy response
proxy.on('proxyRes', function(proxyRes, req, res) {
  if (proxyRes.statusCode >= 301 && proxyRes.statusCode <= 302) {
    var replacer = [ config.parsed_source.hostname ]
    if (config.parsed_source.port) {
      replacer.push(':');
      replacer.push(config.parsed_source.port);
    }

    var location                 = proxyRes.headers['location'];
    var replaced                 = location.replace(config.parsed_target.host, replacer.join(''));
    proxyRes.headers['location'] = replaced;
  }
});

// Use morgan as logger
var accessLogStream = fs.createWriteStream(__dirname + '/app.log', {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));

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

app.use(require('./app/tool/transform')(transforms));

app.use(function(req, res) {
  proxy.web(req, res, {
    target: config.target
  });
});

// Handle errors
proxy.on('error', function(err, req, res) {

  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('We are sorry, but we cannot serve this request.');
});

http.createServer(app).listen(config.port);
console.log('Server started at port ' + config.port);
