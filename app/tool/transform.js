var _ = require('lodash'),
  pipe = require('multipipe');


module.exports = function(transformers) {
  return function(req, res, next) {
    var pr;
    var gunzip = require('zlib').createGunzip();

    var _writeHead = res.writeHead;
    res.writeHead = function(code, headers) {
      var contentType = this.getHeader('content-type');

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

            processors.push(v);
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
        pr.write(buf);
      });

      var _end = res.end;
      res.end = function(data, encoding) {
        if (res.isGziped) {
          gunzip.end(data);
        } else if(pr){
          pr.end(data, encoding);
        }
				else {
					_end.call(res);
				}
      };

      gunzip.on('end', function(data) {
        pr.end(data);
      });

      _writeHead.apply(res, arguments);
    };
    next();
  };
};
