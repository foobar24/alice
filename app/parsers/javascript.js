var replaceStream = require('replaceStream');
var pipe = require('multipipe');


function process() {
  var rLink = replaceStream('//www.decathlon.fr', '//127.0.0.1:5000'),
    rScript = replaceStream(/<script\b[^>]*>([\s\S]*?)<\/script>/g, function(match) {
      return match.split('www.decathlon.fr').join('127.0.0.1:5000');
    });
  return pipe(rLink, rScript);
}

module.exports = require('../tool/transform')(process);
