{print} = require 'util'
{spawn} = require 'child_process'
fs = require 'fs'

build = (callback) ->
  coffee = spawn 'coffee', ['-c', '-o', 'lib', 'src']
  coffee.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  coffee.stdout.on 'data', (data) ->
    print data.toString()
  coffee.on 'exit', (code) ->
    callback?() if code is 0

uglify = (callback) ->
  # Gotta be a better way to do this
  ug = spawn 'uglifyjs', ['lib/kache.js']
  ug.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  ug.stdout.on 'data', (data) ->
    fs.writeFile('lib/kache.min.js', data.toString());

task 'build', 'Build lib/ from src/', ->
  build()
  uglify()

