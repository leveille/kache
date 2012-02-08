{print} = require 'util'
{spawn} = require 'child_process'
fs = require 'fs'

kacheVersion = ->
  data = fs.readFileSync "./packages.json"
  packageData = JSON.parse data
  packageData.version

build = (watch) ->
  args = ['-p', 'src/kache.coffee']
  args.unshift('-w') if watch
  coffee = spawn 'coffee', args
  coffee.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  coffee.stdout.on 'data', (data) ->
    _data = data.toString().replace(/{{version}}/gm, kacheVersion())
    fs.writeFileSync('lib/kache.js', _data);
    uglify()

uglify = ->
  ug = spawn 'uglifyjs', ['lib/kache.js']
  ug.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  ug.stdout.on 'data', (data) ->
    fs.writeFile('lib/kache.min.js', data.toString());

task 'build', 'Build lib/ from src/', ->
  build()

task 'watch', 'Watch src/ for changes and build files', ->
  watch = true
  build(watch)


