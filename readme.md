# jscript

**[JScript](https://en.wikipedia.org/wiki/JScript) runner: a duplex stream wrapper around [cscript](https://technet.microsoft.com/en-us/library/bb490887.aspx) with optional JSON serialization for easy marshalling of data between Node.js and [Windows Script Host](https://en.wikipedia.org/wiki/Windows_Script_Host).**

[![npm status](http://img.shields.io/npm/v/jscript.svg?style=flat-square)](https://www.npmjs.org/package/jscript) [![AppVeyor build status](https://img.shields.io/appveyor/ci/vweevers/jscript.svg?style=flat-square&label=appveyor)](https://ci.appveyor.com/project/vweevers/jscript) [![Dependency status](https://img.shields.io/david/vweevers/jscript.svg?style=flat-square)](https://david-dm.org/vweevers/jscript)

## example

Let's create a `version.js`: a JScript that reads the `FileVersion` of executables.

```js
var JSON = require('json3')
var fs = new ActiveXObject('Scripting.FileSystemObject')

while(!WScript.StdIn.AtEndOfStream) {
  var file = JSON.parse(WScript.StdIn.ReadLine())

  if (fs.FileExists(file.path)) {
    file.version = fs.GetFileVersion(file.path)
  }

  WScript.StdOut.Write(JSON.stringify(file) + '\n')
}
```

Install this script's dependencies and create a bundle with [jscriptify](https://www.npmjs.com/package/jscriptify):

```bash
npm install json3
npm install -g jscriptify
jscriptify version.js > bundle.js
```

Last but not least, an `example.js`:

```js
var jscript = require('jscript')
var path = require('path')
var duplex = jscript('bundle.js', { json: true })

duplex.on('data', function(file) {
  console.log(file.version)
})

process.argv.slice(2).forEach(function (file) {
  duplex.write({ path: path.resolve(file) })
})

duplex.end()
```

And run it with Node.js:

```bash
> node example one.exe two.exe

16.4.8
6.2.3
```

*Note: avoid `StdOut.WriteLine()` because `json-stream` doesn't like CRLF.*

## `jscript(file, [opts])`

- **file**: relative or absolute path to a JScript file.

Options:

- **args** (array): script arguments
- **json** (boolean): if true, wrap stream with JSON serialization
- **debug** (boolean): if true, pipe stderr to process.stderr;
- **native**: if false, don't escape WoW64 redirection (passed to [windows-bin](https://www.npmjs.com/package/windows-bin)).

## install

With [npm](https://npmjs.org) do:

```
npm install jscript
```

## license

[MIT](http://opensource.org/licenses/MIT) © Vincent Weevers
