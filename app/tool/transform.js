const pipe       = require('multipipe')
const through    = require('through')
const iconv      = require('iconv-lite')
const getCharset = require('charset')
const zlib       = require('zlib')
const config     = require('../config')

module.exports = function(transformers) {
  return function(req, res, next) {
    (function() {
      let gunzip = zlib.createGunzip()

      let _writeHead = res.writeHead
      res.writeHead = function(code, headers) {
        let contentType = this.getHeader('content-type')

        // Setup processor pipeline
        let processors = []

        if (typeof contentType != 'undefined') {
          for (let k in transformers) {
            let v = transformers[k]
            if (contentType.indexOf(k) === 0) processors.push(v())
          }
        }

        if (!processors.length) { // nothing to do
          _writeHead.apply(res, arguments)
          return
        }

        // force charset to utf8
        let charset = getCharset(contentType)

        // Do nothing unless the content-type is text. (Fix #21)
        if (!contentType.match("^text/*")) {
          _writeHead.apply(res, arguments)
          return
        }

        if (res.getHeader('Content-Type') && charset)
          res.setHeader('Content-Type', res.getHeader('Content-Type').replace(charset, ('utf8')))

        // Strip off the content length since it will change.
        res.removeHeader('Content-Length')

        if (headers) delete headers['content-length']

        // Force content type to utf8
        processors.unshift(through(function write(data) {
          if (!charset)
            charset = getCharset(res.headers, data)

          if (charset && charset !== 'utf8') {
            data = iconv.encode(iconv.decode(data, charset), 'utf8')
            data = new Buffer(data.toString().replace(charset, 'utf8'))
          }

          this.emit('data', data)
        }))

        // Gunzip response if Gziped
        let contentEncoding = this.getHeader('content-encoding')
        if (contentEncoding && contentEncoding.toLowerCase() == 'gzip') {
          processors.unshift(gunzip)

          // Strip off the content encoding since it will change.
          res.removeHeader('Content-Encoding')

          if (headers) delete headers['content-encoding']
        }

        let pr     = pipe([].concat.apply([], processors))
        let _write = res.write
        let _end   = res.end

        pr.on('data', function(buf) {
          _write.call(res, buf)
        })

        res.write = function(data, encoding) {
          pr.write(data, encoding)
        }

        pr.on('end', function() {
          _end.call(res)
        })

        res.end = function(data, encoding) {
          pr.end(data, encoding)
        }

        _writeHead.apply(res, arguments)
      }

      next()
    }())
  }
}
