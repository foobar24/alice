var replaceStream = require('replacestream'),
  pipe = require('multipipe'),
  config = require('../config');

module.exports = function() {
  var regexp   = new RegExp('(https?\:)?(\/{2})?' + config.parsed_target.hostname, 'gi');
  var replacer = [ config.parsed_source.protocol, '//', config.parsed_source.hostname ];

  return replaceStream(regexp, replacer);
};
