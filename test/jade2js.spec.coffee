describe 'preprocessor jade2js', ->
  chai = require('chai')

  templateHelpers = require('./helpers/template_cache')
  chai.use(templateHelpers)

  expect = chai.expect

  jade2js = require '../lib/jade2js'
  logger = create: -> {debug: ->}
  process = null

  # TODO(vojta): refactor this somehow ;-) it's copy pasted from lib/file-list.js
  File = (path, mtime) ->
    @path = path
    @originalPath = path
    @contentPath = path
    @mtime = mtime
    @isUrl = false

  createPreprocessor = (config = {}) ->
    jade2js logger, '/base', config

  beforeEach ->
    process = createPreprocessor()

  it 'should convert jade to js code', (done) ->
    file = new File '/base/path/file.jade'
    JADE = 'html test me!'
    HTML = '<html>test me!</html>'

    process JADE, file, (processedContent) ->
      expect(processedContent)
        .to.defineModule('path/file.html').and
        .to.defineTemplateId('path/file.html').and
        .to.haveContent HTML
      done()


  it 'should change path to *.js', (done) ->
    file = new File '/base/path/file.jade'

    process '', file, (processedContent) ->
      expect(file.path).to.equal '/base/path/file.html'
      done()


  it 'should preserve new lines', (done) ->
    file = new File '/base/path/file.jade'

    process '| first\n| second', file, (processedContent) ->
      expect(processedContent)
        .to.defineModule('path/file.html').and
        .to.defineTemplateId('path/file.html').and
        .to.haveContent 'first\nsecond'
      done()


  it 'should preserve Windows new lines', (done) ->
    file = new File '/base/path/file.jade'

    process 'first\r\nsecond', file, (processedContent) ->
      expect(processedContent).to.not.contain '\r'
      done()


  it 'should preserve the backslash character', (done) ->
    file = new File '/base/path/file.jade'

    process '| first\\second', file, (processedContent) ->
      expect(processedContent)
        .to.defineModule('path/file.html').and
        .to.defineTemplateId('path/file.html').and
        .to.haveContent 'first\\second'
      done()


  describe 'options', ->
    describe 'stripPrefix', ->
      beforeEach ->
        process = createPreprocessor stripPrefix: 'path/'


      it 'strips the given prefix from the file path', (done) ->
        file = new File '/base/path/file.jade'
        JADE = 'html'
        HTML = '<html></html>'

        process JADE, file, (processedContent) ->
          expect(processedContent)
            .to.defineModule('file.html').and
            .to.defineTemplateId('file.html').and
            .to.haveContent HTML
          done()


    describe 'prependPrefix', ->
      beforeEach ->
        process = createPreprocessor prependPrefix: 'served/'


      it 'prepends the given prefix from the file path', (done) ->
        file = new File '/base/path/file.jade'
        JADE = 'html'
        HTML = '<html></html>'

        process JADE, file, (processedContent) ->
          expect(processedContent)
            .to.defineModule('served/path/file.html').and
            .to.defineTemplateId('served/path/file.html').and
            .to.haveContent HTML
          done()


    describe 'cacheIdFromPath', ->
      beforeEach ->
        process = createPreprocessor
          cacheIdFromPath: (filePath) -> "generated_id_for/#{filePath}"


      it 'invokes custom transform function', (done) ->
        file = new File '/base/path/file.jade'
        JADE = 'html'
        HTML = '<html></html>'

        process JADE, file, (processedContent) ->
          expect(processedContent)
            .to.defineModule('generated_id_for/path/file.jade').and
            .to.defineTemplateId('generated_id_for/path/file.jade').and
            .to.haveContent HTML
          done()

    describe 'moduleName', ->
      beforeEach ->
        process = createPreprocessor
          moduleName: 'foo'

      it 'should generate code with a given module name', ->
        file1 = new File '/base/tpl/one.jade'
        JADE1 = 'span one'
        HTML1 = '<span>one</span>'
        file2 = new File '/base/tpl/two.jade'
        JADE2 = 'span two'
        HTML2 = '<span>two</span>'
        bothFilesContent = ''

        process JADE1, file1, (processedContent) ->
          bothFilesContent += processedContent

        process JADE2, file2, (processedContent) ->
          bothFilesContent += processedContent

        # evaluate both files (to simulate multiple files in the browser)
        expect(bothFilesContent)
          .to.defineModule('foo').and
          .to.defineTemplateId('tpl/one.html').and
          .to.haveContent(HTML1).and
          .to.defineTemplateId('tpl/two.html').and
          .to.haveContent(HTML2)
