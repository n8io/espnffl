var _ = require('underscore');
_.str = require('underscore.string');
var controllers = {};

controllers.pageRouteController = require('../controllers/pageRouteController');
controllers.apiRouteController = require('../controllers/apiRouteController');

module.exports = function(app, options){
  var routes = [
    { "method": "get",  "path" : "/",                                       "controller" : "pageRouteController", "action" : "Default" },
    { "method": "get",  "path" : "/heartbeat",                              "controller" : "pageRouteController", "action" : "Heartbeat" },
    { "method": "get",  "path" : "/:leagueId/:seasonId",                    "controller" : "apiRouteController",  "action" : "Info" },
    { "method": "get",  "path" : "/:leagueId/:seasonId/members",            "controller" : "apiRouteController",  "action" : "Members" },
    { "method": "get",  "path" : "/:leagueId/:seasonId/transactioncounts",  "controller" : "apiRouteController",  "action" : "TransactionCounts" },
    { "method": "get",  "path" : "/:leagueId/:seasonId/finalstandings",     "controller" : "apiRouteController",  "action" : "FinalStandings" },
    { "method": "get",  "path" : "/:leagueId/:seasonId/settings",           "controller" : "apiRouteController",  "action" : "Settings" }
  ];

  var defaultHttpMethod = "get";
  _.each(routes, function(route){
    app[route.method || defaultHttpMethod](route.path, controllers[route.controller][route.action]);
  });
};