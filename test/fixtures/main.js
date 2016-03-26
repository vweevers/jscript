var JSON = require('json3')
var args = WScript.Arguments.Named

if (args.Exists('json')) {
  while(!WScript.StdIn.AtEndOfStream) {
    var num = JSON.parse(WScript.StdIn.ReadLine()).num
    WScript.StdOut.Write(JSON.stringify(num*2) + '\n')
  }
} else if (args.Exists('arch')) {
  var shell = new ActiveXObject('WScript.Shell')
  var env = shell.Environment('Process')

  // Native processor architecture, unless in WOW64 then it's x86
  WScript.StdOut.Write(env('PROCESSOR_ARCHITECTURE'))
} else {
  var i = 0
  while(!WScript.StdIn.AtEndOfStream) {
    var str = WScript.StdIn.ReadLine()
    WScript.StdOut.Write((++i) + str.toUpperCase())
  }
}
