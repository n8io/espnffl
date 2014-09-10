// Global requires
_ = require('underscore');
_.str = require('underscore.string');
moment = require('moment');
request = require('request');
config = require('nconf').env([ 'NODE_ENV' ]);
stringify = require('json-stringify-safe');
mkdirp = require('mkdirp');
rimraf = require('rimraf');
fs = require('fs');
crypto = require('crypto');

var express = require("express"),
  http = require("http"),
  path = require("path"),
  route404 = require('./controllers/404'),
  route500 = require('./controllers/500'),
  configValidator = require('./controllers/configurationValidator'),
  colors = require('colors'),
  configurationLoader = require('./controllers/configurationLoader'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server, {log: false});

// Load and validate config(s)
configurationLoader.load();

if(config.get('logger.streams') && config.get('logger.streams').length){
  //Do some log cleanup
  rimraf.sync('./logs');
  mkdirp.sync('./logs');
  fs.writeFileSync('./logs/log.log');
}

// Initialize logger
logger = require('./controllers/logger').getLogger(config.get('logger'));

configValidator.validate();

// Global variables
appName = config.get('name');
options = {};

var cookieExpiration = 1 * 60 * 60 * 1000; // 1 hour // sliding in ms

app.configure(function() {
  app.set("name", appName);
  app.set("port", process.env.PORT || config.get('port') || 3000);
  app.set("host", process.env.IP || config.get('hostname'));
  app.use(express.logger("dev"));
  if(config.get('compression:enabled')){
    app.use(express.compress());
  }
  app.use(express.favicon(__dirname + '/public/img/favicon.png'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
  app.use(route500); //catch unhandled errors, throw 500
  app.use(route404); //no route mapped, throw 404
});

app.configure("development", function() {
  return app.use(express.errorHandler());
});

// Setup some top level routes
require("./routes/all")(app, options);
require("./routes")(app, options);

http.createServer(app).listen(app.get("port"), app.get("host"), function () {
  startSelfPingTimer();
  logAppSummary();
  return;
});

function logAppSummary(){
  try{ //Logging should never cause the app to fail
    console.log('\n' + (config.get('name') + ' application running (' + config.get('hostname') + ':' + config.get('port') + ')...').green);
    console.log(('See logs for more details (' + getLogFilename(config.get()) + ').\n').grey);
    logger.info('Environment info:', config.get('NODE_ENV'));
    logger.info('Using config files: [' + config.get('defaultConfig') + ', ' + config.get('envConfig') + ']');
    if(config.get('compression:enabled')){
      logger.info('GZip compression is enabled.');
    }
    else{
      logger.warn('GZip compression is disabled. This should be enabled in a production environment.');
    }
    logger.info('Some witty message to uniquely identify your app here.');
    logger.info('Express server listening on host and port: ' + app.get('host') + ':' + app.get('port'));
    logger.info('Self-ping set for every ' + config.get('selfPing:intervalInSecs') + ' seconds');
  }
  catch(e){
    console.log(e);
  }
}

var selfPingInterval = null;
function startSelfPingTimer(){
  clearInterval(selfPingInterval);

  selfPingInterval = setInterval(function(){
    var opts = {uri:config.get('selfPing:uri')};
    request(opts, function(err, results){
      if(err){
        logger.error(err);
        return;
      }

      logger.info('Self-ping @ ' + config.get('selfPing:uri') + ' returned 200 OK');
    });
  }, config.get('selfPing:intervalInSecs') * 1000);
}

function getLogFilename(config){
  var filestream = _.findWhere(config.logger.streams || [], { "type" : "rotating-file" });
  if(!filestream){
    return 'not configured';
  }
  return filestream.path || 'not configured';
}

function encrypt(decrypted){
  var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
  var key = config.get('encryptionKey') || 'hotcheetosandtakis';

  var cipher = crypto.createCipher(algorithm, key);
  return cipher.update(decrypted, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(encrypted){
  var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
  var key = config.get('encryptionKey') || 'hotcheetosandtakis';

  var decipher = crypto.createDecipher(algorithm, key);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}