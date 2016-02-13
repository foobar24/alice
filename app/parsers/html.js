var replaceStream = require('replacestream'),
  pipe = require('multipipe'),
  url = require('url'),
  config = require('../../config');

module.exports = function() {
  target = url.parse(config.target);

  return [
    replaceStream('//' + target.hostname, '//' + config.source),
    replaceStream(/<script\b[^>]*>([\s\S]*?)<\/script>/g, function(match) {
      return match.split(target.hostname).join(config.source);
    })
  ];
};
