var bunyan = require('bunyan');

var logger = function(){};

logger.getLogger = function getLogger(options){
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