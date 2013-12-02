var _ = require('underscore');
_.str = require('underscore.string');
var controllers = {};

// Load up any controllers that your routes below may use
// i.e., controllers.apiController = require('../controllers/apiController');

module.exports = function(app, options){
  var routes = [
    // Define routes here
    // i.e, { "method" : "get", "path" : "/profile", "controller" : "apiController", "action" : "GetProfile" }
  ];

  var defaultHttpMethod = "get";
  _.each(routes, function(route){
    app[route.method || defaultHttpMethod](route.path, controllers[route.controller][route.action]);
  });
};