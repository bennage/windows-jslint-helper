This is a script that allows you to run jslint from a command-line on Windows. 
It uses Windows Scripting Host (WSH).

To run jslint, use cscript.exe. This is the command-line version of WSH.

For example, to check a single JavaScript file:

    cscript.exe jslint-helper-for-wsh.js file_to_check.js

To scan an entire directory of JavaScript files:

    cscript.exe jslint-helper-for-wsh.js /d:some_directory