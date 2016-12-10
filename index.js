'use strict';

var spawn      = require('child_process').spawn
  , parseJSON  = require('json-stream')
  , duplexify  = require('duplexify')
  , wbin       = require('windows-bin')
  , through2   = require('through2')
  , resolve    = require('path').resolve

function createStream (script, opts_) {
  var opts = opts_ || {}
  var duplex = opts.json ? duplexify.obj() : duplexify()

  function destroy(err) {
    duplex.destroy(err)
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

    child.on('error', destroy)
    child.on('exit', function (code) {
      if (code) destroy(exitError(code))
    })

    var input = child.stdin
    var output = child.stdout

    if (opts.json) {
      input = stringify()
      input.pipe(child.stdin)
      input.on('error', destroy)
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

function exitError(code) {
  var err = new Error('Exited with code ' + code)
  err.code = code
  return err
}

module.exports = createStream
