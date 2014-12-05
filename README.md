# karma-ng-jade2module-preprocessor

> Preprocessor for converting Jade template files to [AngularJS](http://angularjs.org/) templates.

*Note:* If you are looking for a general preprocessor that is not tight to Angular, check out [karma-html2js-preprocessor](https://github.com/karma-runner/karma-html2js-preprocessor).

## Installation

The easiest way is to keep `karma-ng-jade2module-preprocessor` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma": "~0.12",
    "karma-ng-jade2module-preprocessor": "~0.5"
  }
}
```

You can simple do it by:
```bash
npm install karma-ng-html2module-preprocessor --save-dev
```

## Configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    preprocessors: {
      '**/*.jade': ['ng-jade2module']
    },

    files: [
      '*.js',
      '*.html'
    ],

    ngJade2ModulePreprocessor: {
      // strip this from the file path
      stripPrefix: 'public/',
      // prepend this to the file path
      prependPrefix: 'served/',

      // or define a custom transform function
      cacheIdFromPath: function(filepath) {
        return cacheId;
      },

      // the configuration options that will be sent to jade render() method, eg:
      jadeRenderConfig : {
        __: function(str) {
          return str;
        }
      },

      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('foo')
      moduleName: 'foo'
    }
  });
};
```

## How does it work ?

This preprocessor converts Jade file into HTML files, and then into JS strings and generates Angular modules. These modules, when loaded, puts these HTML files into the `$templateCache` and therefore Angular won't try to fetch them from the server.

For instance this `template.jade`...
```jade
div something
```
... will be served as `template.html`. The underlaying code does a:
```js
angular.module('foo', []).config(function($templateCache) {
  $templateCache.put('template.html', '<div>something</div>');
});
```

(foo comes from the *moduleName* configuration property).

So testing a directive that is declared like:

```js
angular.module('example')
.directive('exampleDirective', function() {
  return {
    restrict: 'E',
    templateUrl: 'template.html'
  };
})
```

will have the `template.jade` injected !

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
