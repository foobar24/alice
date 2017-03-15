var replaceStream = require('replacestream'),
  pipe = require('multipipe'),
  _ = require('lodash'),
  config = require('../config');

module.exports = function() {
  var regexp   = new RegExp('(https?\:)?(\/{2})?' + config.parsed_target.hostname, 'gi');
  var replacer = [ config.parsed_source.protocol, '//', config.parsed_source.hostname ];

  if (config.parsed_source.port) {
    replacer.push(':');
    replacer.push(config.parsed_source.port);
  }

  replacer = replacer.join('');

  var handlers = [
    replaceStream(regexp, replacer),
    replaceStream(/<script\b[^>]*>([\s\S]*?)<\/script>/g, function(match) {
      return match.split(regexp).join(replacer);
    })
  ];

  if(config.hostnames_to_replace && _.keys(config.hostnames_to_replace).length > 0){
    _.each(config.hostnames_to_replace, function(target, source){
      handlers.push(replaceStream('//' + source, '//' + target));
    });
  }

  return handlers;
};
