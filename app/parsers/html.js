var replaceStream = require('replacestream');
var pipe = require('multipipe');

module.exports = function() {
  return [
    replaceStream('//rkn.gov.ru', '//127.0.0.1:5000'),
    replaceStream(/<script\b[^>]*>([\s\S]*?)<\/script>/g, function(match) {
      return match.split('rkn.gov.ru').join('127.0.0.1:5000');
    })
  ];
};
