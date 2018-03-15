const httpProxy = require('http-proxy');
const connect   = require('connect');
const http      = require('http');
const fs        = require('fs');
const morgan    = require('morgan');
const config    = require('./app/config');

// Basic Connect App
const app = connect();

// Initialize reverse proxy
const proxy = httpProxy.createProxyServer({ secure: false });

// Handle proxy response
proxy.on('proxyRes', function(proxyRes) {
  if (proxyRes.statusCode >= 301 && proxyRes.statusCode <= 302) {
    let replacer = [config.parsed_source.hostname];

    if (config.parsed_source.port) {
      replacer.push(':');
      replacer.push(config.parsed_source.port);
    }

    let location                 = proxyRes.headers['location'];
    let replaced                 = location.replace(config.parsed_target.host, replacer.join(''));
    proxyRes.headers['location'] = replaced;
  }
});

// Use morgan as logger
const accessLogStream = fs.createWriteStream(config.log_path, { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// Handle http requests
app.use(function(req, res, next) {
  req.headers['host']   = config.parsed_target.host;
  req.headers['origin'] = config.target;

  next();
});

const transforms = {
  'text/html':              require('./app/parsers/html'),
  'application/javascript': require('./app/parsers/javascript')
};

app.use(require('./app/tool/transform')(transforms));

app.use(function(req, res) {
  proxy.web(req, res, { target: config.target });
});

// Handle proxy errors
proxy.on('error', function(err, req, res) {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('We are sorry, but we cannot serve this request.');
});

http.createServer(app).listen(config.port, function() {
  // eslint-disable-next-line
  console.log(`Server listen on http://127.0.0.1:${config.port}`);
});
