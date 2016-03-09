var replaceStream = require('replacestream'),
  pipe = require('multipipe'),
  _ = require('lodash');

module.exports = function(config) {

  var handlers = [
    replaceStream('//' + config.parsed_target.hostname, '//' + config.source),
    replaceStream(/<script\b[^>]*>([\s\S]*?)<\/script>/g, function(match) {
      return match.split(config.parsed_target.hostname).join(config.source);
    })
  ];

  if(config.hostnames_to_replace && _.keys(config.hostnames_to_replace).length > 0){
    _.each(config.hostnames_to_replace, function(target, source){
      handlers.push(replaceStream('//' + source, '//' + target));
    });
  }

  return handlers;
};
