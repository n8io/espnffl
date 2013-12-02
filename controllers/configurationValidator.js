var _ = require('underscore');

var configValidator = function(){};

// Array of config values that must be present with a value for the app to run
var existsChecks = [
];

var placholderChars = ['X','#'];

configValidator.isValid = function(){
  var isValid = true;

  _.each(existsChecks, function(key){
    if(!config.get(key)){
      isValid = false;
    }
  });

  return isValid;
};

configValidator.getErrors = function(){
  var errors = [];

  _.each(existsChecks, function(key){
    if(!config.get(key) && !_.findWhere(errors, { "key" : key })){
      errors.push({
        "key":key,
        "errorReason": "Value empty or does not exist in config."
      });
    }
  });

  return errors;
};

configValidator.validate = function(){
  // Lastly, validate config
  if(!configValidator.isValid()){
    try{ //Logging should never cause the app to fail
      var errors = configValidator.getErrors();

      // Let the user know which config files were evaluated
      logger.info('Using config files: [' + config.get('defaultConfig') + ', ' + config.get('envConfig') + ']');

      _.each(errors, function(err){
        logger.error('[' + err.key + '] ' + err.errorReason);
      });

      logger.error('Application is improperly configured. See errors above.');
    }
    catch(e){}

    // Exit app with error because it is not configured properly
    process.exit(1);
  }
};
module.exports = configValidator;