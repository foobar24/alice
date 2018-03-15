const replaceStream = require('replacestream');
const config        = require('../config');

module.exports = function() {
  let regexp   = new RegExp(`(https?:)?(/{2})?${config.parsed_target.hostname}`, 'gi');
  let replacer = [config.parsed_source.protocol, '//', config.parsed_source.hostname];

  return replaceStream(regexp, replacer);
};
