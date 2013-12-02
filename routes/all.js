var _ = require('underscore'),
  url = require('url');
module.exports = function(app, options){
  app.all('*', function(req, res, next){
    // Perform any work that needs to be done each request

    var parsedUrl = url.parse(req.url);

    if(parsedUrl.pathname.toLowerCase() === '/endpoints'){
      return res.json(200, [
        '/:leagueId/:seasonId',
        '/:leagueId/:seasonId/members',
        "/:leagueId/:seasonId/transactioncounts",
        '/:leagueId/:seasonId/finalstandings',
        "/:leagueId/:seasonId/settings"
      ]);
    }

    var passedInToken = req.query.apiKey || req.query.apikey || req.headers['apiKey'] || req.headers['apikey'] || req.body.apiKey || req.body.apikey || '';
    var apiKeys = config.get('apiKeys');

    var matchingToken = _(apiKeys).find(function(at){
      return at.key.toLowerCase() === passedInToken.toLowerCase();
    });

    if(!matchingToken){
      res.status('403').json({ 'message' : 'Unauthorized for this resource.' });
    }

    options.access = matchingToken;


    return next();
  });
};