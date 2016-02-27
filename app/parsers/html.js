var replaceStream = require('replacestream'),
  pipe = require('multipipe');

module.exports = function(config) {
  return [
    replaceStream('//' + config.parsed_target.hostname, '//' + config.source),
    replaceStream(/<script\b[^>]*>([\s\S]*?)<\/script>/g, function(match) {
      return match.split(config.parsed_target.hostname).join(config.source);
    })
  ];
};
