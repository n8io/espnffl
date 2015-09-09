var path = require("path");

/**
 * Loads configuration into nconf global obj based on a base file name
 * @return {void}
 */
var configurationLoader = function() {};

configurationLoader.load = function() {
  var configFileBaseName = 'config';

  /** Default to 'dev' in case it is not supplied */
  config.defaults({'NODE_ENV': 'dev'});

  // Read in any command line args for overrides
  config.argv();

  /** Load environment config from file system */
  var envConfig = configFileBaseName + '.' + config.get('NODE_ENV') + '.json';
  config.file({
    file: envConfig,
    dir: path.join(__dirname, '..', 'config'),
    search: true
  });

  // Load default configuration from file system
  var defaultConfigPath = path.join(__dirname, '..', 'config', configFileBaseName + '.base.json');
  config.file('default', defaultConfigPath);

  config.set('envConfig', envConfig);
  config.set('defaultConfig', configFileBaseName +  '.json');

  return config;
};

module.exports = configurationLoader;
