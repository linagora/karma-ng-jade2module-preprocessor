var util = require('util');
var jade = require('jade');

var TEMPLATE = 'angular.module(\'%s\', []).run(function($templateCache) {\n' +
  '  $templateCache.put(\'%s\',\n    \'%s\');\n' +
  '});\n';

var SINGLE_MODULE_TPL = '(function(module) {\n' +
  'try {\n' +
  '  module = angular.module(\'%s\');\n' +
  '} catch (e) {\n' +
  '  module = angular.module(\'%s\', []);\n' +
  '}\n' +
  'module.run(function($templateCache) {\n' +
  '  $templateCache.put(\'%s\',\n    \'%s\');\n' +
  '});\n' +
  '})();\n';

var escapeContent = function(content) {
  return content.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\r?\n/g, '\\n\' +\n    \'');
};

var createJade2JsPreprocessor = function(logger, basePath, config) {
  config = typeof config === 'object' ? config : {};

  var log = logger.create('preprocessor.jade2js');
  var moduleName = config.moduleName;
  var stripPrefix = new RegExp('^' + (config.stripPrefix || ''));
  var prependPrefix = config.prependPrefix || '';
  var cacheIdFromPath = config && config.cacheIdFromPath || function(filepath) {
    return prependPrefix + filepath.replace(stripPrefix, '').replace(/.jade$/, '.html');
  };

  return function(content, file, done) {
    log.debug('Processing "%s".', file.originalPath);
    config.jadeRenderConfig = config.jadeRenderConfig || {};
    var jadePath = cacheIdFromPath(file.originalPath.replace(basePath + '/', ''));

    content = jade.compile(content, {filename: file.originalPath})(config.jadeRenderConfig);

    file.path = file.path.replace(/.jade$/, '.html');

    if (moduleName) {
      done(util.format(SINGLE_MODULE_TPL, moduleName, moduleName, jadePath, escapeContent(content)));
    } else {
      done(util.format(TEMPLATE, jadePath, jadePath, escapeContent(content)));
    }
  };
};

createJade2JsPreprocessor.$inject = ['logger', 'config.basePath', 'config.ngJade2JsPreprocessor'];

module.exports = createJade2JsPreprocessor;