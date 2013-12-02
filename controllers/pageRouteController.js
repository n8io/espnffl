var os = require('os'),
  bytes = require('bytes'),
  exec = require('child_process').exec;

var pageRouteController = function(options){};

pageRouteController.Default = function (req, res) {
  res.status(200).send('This is an api. What are you doing here?');
  return;
};

pageRouteController.Heartbeat = function (req, res) {
  res.status(200).send('OK');
  return;
};

module.exports = pageRouteController;