'use strict';

var spawn      = require('child_process').spawn
  , parseJSON  = require('json-stream')
  , duplexify  = require('duplexify')
  , wbin       = require('windows-bin')
  , through2   = require('through2')
  , resolve    = require('path').resolve

function createStream (script, opts_) {
  var opts = opts_ || {}
  var json = opts.wrap === 'json' || opts.json
  var duplex = json ? duplexify.obj() : duplexify()

  function errback(err) {
    if (err) duplex.destroy(err)
  }

  // Find the cscript binary. If we're on 64-bit Windows and 32-bit
  // Node.js then prefer the native "Sysnative\cscript.exe", because
  // otherwise we would be redirected to "SysWow64\cscript.exe" and
  // then be unable to access the native registry (without resorting
  // to the slower ExecMethod). See also win-detect-browsers#18.
  wbin('cscript', { native: opts.native }, function(err, bin) {
    if (err) return duplex.destroy(err)

    var args = ['//Nologo', '//B', resolve(script)].concat(opts.args || [])
    var child = spawn(bin, args, {
      stdio: ['pipe', 'pipe', opts.debug ? 'pipe' : 'ignore']
    })

    child.on('error', errback)

    var input = child.stdin
    var output = child.stdout

    if (json) {
      input = stringify()
      input.pipe(child.stdin)
      input.on('error', errback)
      output = output.pipe(parseJSON())
    }

    duplex.setReadable(output)
    duplex.setWritable(input)

    if (opts.debug) child.stderr.pipe(process.stderr)
    duplex.stderr = child.stderr
  })

  return duplex
}

function stringify() {
  // Push a newline *after* the JSON, or WScript.StdIn.ReadLine() will hang.
  return through2.obj(function(req, enc, next) {
    next(null, JSON.stringify(req) + '\r\n')
  })
}

module.exports = createStream
