var _ = require('lodash'),
  pipe = require('multipipe'),
  through = require('through'),
  iconv = require('iconv-lite'),
  getCharset = require('charset'),
  zlib = require('zlib'),
  config = require('../config');

module.exports = function(transformers) {
  return function(req, res, next) {
    (function() {
      var gunzip = zlib.createGunzip();

      var _writeHead = res.writeHead;
      res.writeHead = function(code, headers) {
        var contentType = this.getHeader('content-type');

        // Setup processor pipeline
        var processors = [];
        if (typeof contentType != 'undefined') {
          _.forEach(transformers, function(v, k) {
            if (contentType.indexOf(k) === 0) {
              processors.push(v());
            }
          });
        }

        if (!processors.length) { // nothing to do
          _writeHead.apply(res, arguments);
          return;
        }

        // force charset to utf8
        var charset = getCharset(contentType);
        if (res.getHeader('Content-Type') && charset) {
          res.setHeader('Content-Type', res.getHeader('Content-Type').replace(charset, ('utf8')));
        }

        // Strip off the content length since it will change.
        res.removeHeader('Content-Length');
        if (headers)
          delete headers['content-length'];

        // Force content type to utf8
        processors.unshift(through(function write(data) {
          if (!charset)
            charset = getCharset(res.headers, data);

          if (charset && charset !== 'utf8') {
            data = iconv.encode(iconv.decode(data, charset), 'utf8');
            data = new Buffer(data.toString().replace(charset, 'utf8'));
          }
          this.emit('data', data);
        }));

        // Gunzip response if Gziped
        var contentEncoding = this.getHeader('content-encoding');
        if (contentEncoding && contentEncoding.toLowerCase() == 'gzip') {
          processors.unshift(gunzip);

          // Strip off the content encoding since it will change.
          res.removeHeader('Content-Encoding');
          if (headers)
            delete headers['content-encoding'];
        }

        var pr = pipe(_.flatten(processors));

        var _write = res.write;
        pr.on('data', function(buf) {
          _write.call(res, buf);
        });
        res.write = function(data, encoding) {
          pr.write(data, encoding);
        };

        var _end = res.end;
        pr.on('end', function() {
          _end.call(res);
        });
        res.end = function(data, encoding) {
          pr.end(data, encoding);
        };

        _writeHead.apply(res, arguments);
      };
      next();
    }());
  };
};
