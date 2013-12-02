var fs = require('fs');
module.exports = function(app, options) {
  fs.readdirSync(__dirname).forEach(function(file) {
    if (file === "index.js" || file === "all.js" || file.substr(file.lastIndexOf('.') + 1) !== 'js')
      return;

    var name = file.substr(0, file.indexOf('.'));

    require('./' + name)(app, options);
  });
};