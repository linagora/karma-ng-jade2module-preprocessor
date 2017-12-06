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
npm install karma-ng-jade2module-preprocessor --save-dev
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

      // the locals object, eg:
      jadeRenderLocals: {
        __: function(str) {
          return str;
        }
      },

      // the configuration options that will be sent to jade render() method,
      // see Options section bellow, eg:
      jadeRenderOptions: {
        pretty: true
      },

      // DEPRECATED: the locals object, eg:
      jadeRenderConfig: {
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

## Options
* **basedir**: string
The root directory of all absolute inclusion.

* **doctype**: string
If the doctype is not specified as part of the template, you can specify it here. It is sometimes useful to get self-closing tags and remove mirroring of boolean attributes.

* **pretty**: boolean | string
Adds whitespace to the resulting HTML to make it easier for a human to read using *'  '* as indentation. If a string is specified, that will be used as indentation instead (e.g. *'\t'*). Defaults to *false*.

* **filters**: object
Hash table of *custom filters*. Defaults to *undefined*.

* **self**: boolean
Use a *self* namespace to hold the locals. It will speed up the compilation, but instead of writing *variable* you will have to write *self.variable* to access a property of the locals object. Defaults to *false*.

* **debug**: boolean
If set to *true*, the tokens and function body are logged to *stdout*.

* **compileDebug**: boolean
If set to *true*, the function source will be included in the compiled template for better error messages (sometimes useful in development). It is enabled by default unless used with *Express* in production mode.

* **globals**: Array<string>
Add a list of global names to make accessible in templates.

* **cache**: boolean
If set to *true*, compiled functions are cached. *filename* must be set as the cache key. Only applies to *render* functions. Defaults to *false*.

* **inlineRuntimeFunctions**: boolean
Inline runtime functions instead of *require*-ing them from a shared version. For *compileClient* functions, the default is *true* so that one does not have to include the runtime. For all other compilation or rendering types, the default is *false*.

* **name**: string
The name of the template function. Only applies to *compileClient* functions. Defaults to *'template'*.

* **__**: function
This i18n function is passed as a *local* argument for *jade.compile*

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
