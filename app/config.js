var url  = require('url');
var path = require('path');

var config;

// Get config
if(process.argv[2]){
  config = require(path.resolve(process.argv[2]));
} else {
  config = require('../config');
}

config.parsed_target = url.parse(config.target);
config.parsed_source = url.parse(config.source);
config.log_path      = path.resolve(config.log_path || './app.log');
module.exports       = config;
