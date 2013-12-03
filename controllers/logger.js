var
  bunyan = require('bunyan'),
  mkdirp = require('mkdirp'),
  fs = require('fs');

var logger = function(){};

logger.getLogger = function getLogger(options){
  if(!fs.existsSync('./logs')){
    mkdirp.sync('logs');
  }

  if(!fs.existsSync('./logs/log.log')){
    fs.writeFileSync('./logs/log.log','');
  }

  if(!(options && options.streams)) {
    throw new Error('Invalid logger configuration.');
  }

  if(config.get('logger:enableConsole')){
    options.streams.push(
      // log DEBUG and above to stdout
      {
        "level": "debug",
        "stream": process.stdout
      }
    );
  }

  var logger = bunyan.createLogger(options);

  logger.log = logger.debug;

  return logger;
};

module.exports = logger;