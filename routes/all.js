var _ = require('underscore'),
  url = require('url');
module.exports = function(app, options){
  app.all('*', function(req, res, next){
    // Perform any work that needs to be done each request

    var parsedUrl = url.parse(req.url);

    if(parsedUrl.pathname === '/' || parsedUrl.pathname.toLowerCase() === '/endpoints'){
      return res.json(200, [
        '/:leagueId/trophies',
        '/:leagueId/trophies/history/:trophyId',
        '/:leagueId/:seasonId',
        '/:leagueId/:seasonId/members',
        '/:leagueId/:seasonId/draftrecap',
        "/:leagueId/:seasonId/transactioncounts",
        '/:leagueId/:seasonId/finalstandings',
        "/:leagueId/:seasonId/settings",
        "/:leagueId/:seasonId/:teamId/schedule",
        "/:leagueId/:seasonId/:weekId/scores",
        "/:leagueId/:seasonId/:weekId/:teamId/matchup",
        "/heartbeat"
      ]);
    }

    if(parsedUrl.pathname.toLowerCase() === '/heartbeat'){
      return res.json(200, {
        'status' : 'OK'
      });
    }

    var passedInToken = req.query.apiKey || req.query.apikey || req.headers['apiKey'] || req.headers['apikey'] || req.body.apiKey || req.body.apikey || '';

    var cfg;
    if(process.env.env_config){
      cfg = JSON.parse(decrypt(process.env.env_config));
    }

    var apiKeys = config.get('apiKeys') || (cfg && cfg.apiKeys);

    if(apiKeys && apiKeys.length > 0){
      var matchingToken = _(apiKeys).find(function(at){
        return at.key.toLowerCase() === passedInToken.toLowerCase();
      });

      if(!matchingToken){
        return res.status('403').json({ 'message' : 'Unauthorized for this resource.' });
      }

      options.access = matchingToken;
    }
    else{
      return res.status('403').json({ 'message' : 'Unauthorized for this resource.' });
    }

    return next();
  });
};

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