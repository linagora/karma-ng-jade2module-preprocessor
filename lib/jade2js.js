var util = require('util');
var pug = require('pug');
var _ = require('lodash');

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
    return prependPrefix + filepath.replace(stripPrefix, '').replace(/.pug$/, '.html');
  };

  return function(content, file, done) {
    log.debug('Processing "%s".', file.originalPath);
    config.jadeRenderConfig = config.jadeRenderConfig || {};
    config.jadeRenderOptions = config.jadeRenderOptions || {};
    config.jadeRenderLocals = config.jadeRenderLocals || {};

    var jadePath = cacheIdFromPath(file.originalPath.replace(basePath + '/', ''));
    var supportedOptionKeys = [
      'basedir', 'doctype', 'pretty', 'filters', 'self', 'debug', 'compileDebug',
      'globals', 'cache', 'inlineRuntimeFunctions', 'name'
    ];
    var options = _.extend({ filename: file.originalPath }, _.pick(config.jadeRenderOptions, supportedOptionKeys));
    var locals = _.extend({}, config.jadeRenderConfig, config.jadeRenderLocals);
    var output = pug.compile(content, options)(locals);

    if (moduleName) {
      done(util.format(SINGLE_MODULE_TPL, moduleName, moduleName, jadePath, escapeContent(output)));
    } else {
      done(util.format(TEMPLATE, jadePath, jadePath, escapeContent(output)));
    }
  };
};

createJade2JsPreprocessor.$inject = ['logger', 'config.basePath', 'config.ngJade2ModulePreprocessor'];

module.exports = createJade2JsPreprocessor;
