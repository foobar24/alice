var replaceStream = require('replacestream'),
  pipe = require('multipipe');

module.exports = function(config) {
  return replaceStream(config.parsed_target.hostname, config.source);
};
