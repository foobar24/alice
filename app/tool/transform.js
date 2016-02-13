var _ = require('lodash'),
  pipe = require('multipipe');

var iconv = require('iconv-lite');
var getCharset = require('charset');


module.exports = function(transformers) {
  return function(req, res, next) {
    (function() {
      var pr, charset;
      var gunzip = require('zlib').createGunzip();

      var _writeHead = res.writeHead;
      res.writeHead = function(code, headers) {
        var contentType = this.getHeader('content-type');
        charset = getCharset(contentType);

        // force charset to utf8
        if(res.getHeader('Content-Type')) {
          res.setHeader('Content-Type', res.getHeader('Content-Type').replace(charset, ('utf8')));
        }

        // Sniff out the content-type header.
        var processors = [];
        if (typeof contentType != 'undefined') {
          _.forEach(transformers, function(v, k) {
            if (contentType.indexOf(k) === 0) {
              // Strip off the content length since it will change.
              res.removeHeader('Content-Length');

              if (headers) {
                delete headers['content-length'];
              }

              processors.push(v());
            }
          });
        }

        if (processors.length) {
          var contentEncoding = this.getHeader('content-encoding');
          /* Sniff out the content-type header.
           * If the response is Gziped, we're have to gunzip content before and ungzip content after.
           */
          if (contentEncoding && contentEncoding.toLowerCase() == 'gzip') {
            res.isGziped = true;

            // Strip off the content encoding since it will change.
            res.removeHeader('Content-Encoding');

            if (headers) {
              delete headers['content-encoding'];
            }
          }

          pr = pipe(_.flatten(processors));

          pr.on('data', function(buf) {
            _write.call(res, buf);
          });

          pr.on('end', function() {
            _end.call(res);
          });
        }

        var _write = res.write;
        res.write = function(data, encoding) {
          if (pr) {
            if (res.isGziped) {
              gunzip.write(data);
            } else {
              pr.write(data, encoding);
            }
          } else {
            _write.apply(res, arguments);
          }
        };

        gunzip.on('data', function(buf) {
          var _buf = buf;
          if (charset && charset !== 'utf8') {
            _buf = iconv.encode(iconv.decode(buf, charset), 'utf8');
          }
          if (pr)
            pr.write(_buf);
          else
            _write.call(res, _buf);
        });

        var _end = res.end;
        res.end = function(data, encoding) {
          if (res.isGziped) {
            gunzip.end(data);
          } else if (pr) {
            pr.end(data, encoding);
          } else {
            _end.call(res);
          }
        };

        gunzip.on('end', function(data) {
          if (pr)
            pr.end(data);
          else
            _end.call(res);
        });

        _writeHead.apply(res, arguments);
      };
      next();
    }());
  };
};
