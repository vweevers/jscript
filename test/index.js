var test = require('tape')
  , concat = require('concat-stream')
  , env = require('windows-env')
  , jscript = require('../')
  , bundle = __dirname + '/fixtures/bundle.js'

test('json', function (t) {
  t.plan(1)

  var duplex = jscript(bundle, { json: true, args: ['/json'] })

  duplex.pipe(concat({ encoding: 'object' }, function (items) {
    t.same(items, [2, 4], 'result ok')
  }))

  duplex.write({ num: 1 })
  duplex.write({ num: 2 })
  duplex.end()
})

test('json without input', function (t) {
  t.plan(1)

  var duplex = jscript(bundle, { json: true, args: ['/json-without-input'] })

  duplex.pipe(concat({ encoding: 'object' }, function (items) {
    t.same(items, [1, 2, 3], 'result ok')
  }))

  duplex.end()
})

test('plain', function (t) {
  t.plan(1)

  var duplex = jscript(bundle, { args: ['/plain'] })

  duplex.pipe(concat(function (res) {
    t.same(res.toString(), '1A2B', 'result ok')
  }))

  duplex.end('a\nb')
})

test('plain without input', function (t) {
  t.plan(1)

  var duplex = jscript(bundle, { args: ['/plain-without-input'] })

  duplex.pipe(concat(function (res) {
    t.same(res.toString(), 'hello\nworld', 'result ok')
  }))

  duplex.end()
})

test('arch', function (t) {
  t.plan(4)

  var x64 = [ 'AMD64', 'IA64', 'EM64T' ]
  var x86 = [ 'x86' ]

  if (env.X64) {
    t.pass('64bit machine')

    if (process.arch === 'ia32') {
      t.pass('32bit node')
      getCscriptArch(true, x64)
      getCscriptArch(false, x86)
    } else {
      t.pass('64bit node')
      getCscriptArch(true, x64)
      getCscriptArch(false, x64)
    }
  } else {
    t.pass('32bit machine')
    t.pass('32bit node')
    getCscriptArch(true, x86)
    getCscriptArch(false, x86)
  }

  function getCscriptArch(native, expected) {
    var duplex = jscript(bundle, { native: native, args: ['/arch'] })

    duplex.on('data', function (arch) {
      arch = arch.toString().trim()
      var mode = native ? 'forced' : 'auto'
      t.ok(expected.indexOf(arch) >=0, 'cscript arch in ' + mode + ' mode = ' + arch)
    })
  }
})

test('exit code', function (t) {
  t.plan(2)

  var duplex = jscript(bundle, { args: ['/exit-code'] })

  duplex.on('error', function (err) {
    t.is(err && err.message, 'Exited with code 2')
    t.is(err && err.code, 2)
  })
})
