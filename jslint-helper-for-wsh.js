/*jslint evil: true, white: true, onevar: true, undef: true, nomen: true, regexp: true, plusplus: true, bitwise: true, newcap: true, maxerr: 10, indent: 4 */
/*global JSLINT, WScript, ActiveXObject, Enumerator*/
(function () {

    var jslint_path = 'JSLint\\jslint.js',
        jslint_source = '',
        utf8 = '﻿',
        fso = new ActiveXObject('Scripting.FileSystemObject'),
        files = [],
        globals,
        args = WScript.Arguments;

    function echo(msg) {
        WScript.Echo(msg);
    }

    function ltrim(s) {
        return (s === undefined) ? '' : s.replace(/^\s+/, '');
    }

    function readFile(fileName) {

        var for_reading = 1,
            default_encoding = -2,
            lines = [],
            content = '',
            i = 0,
            count = 0,
            file,
            stream;

        try {
            file = fso.GetFile(fileName);
            stream = file.OpenAsTextStream(for_reading, default_encoding);
        } catch (e) {
            echo("Unable to read file: " + fileName);
            throw e;
        }
        
        while (!stream.AtEndOfStream) {
            lines[count] = stream.ReadLine();
            count += 1;
        }

        stream.Close();
        
        if (lines[0]) {
            if (lines[0].substr(0, 3) === utf8) {
                lines[0] = lines[0].replace(utf8, '');
            }
        }        

        for (i = 0; i < lines.length; i += 1) {
            content += lines[i] + '\n';
        }

        return content;
    }

    function reportError(error, index) {
        echo('\n    error [' + index + ']');
        echo('    line ' + error.line + ' character ' + error.character);
        echo('    ' + error.reason);
        echo('    ' + ltrim(error.evidence));
    }

    function processErrors(errors) {
        var i,
            error;
            
        for (i = 0; i < errors.length; i += 1) {
            error = errors[i];
            if (error) {
                reportError(error, i);
            }
        }
    }

    function process(files) {
        var i,
            fileName,
            script_source,
            result,
            error;
        
        for (i = 0; i < files.length; i += 1) {
            fileName = files[i];
            script_source = readFile(fileName);
            echo("--" + fileName);
            if(globals) {
                script_source = '/*globals ' + globals + ' */' + script_source;
            }
            script_source = '/*jslint undef: false */' + script_source;

            result = JSLINT(script_source);

            if (result) {
                echo('OK: ' + fileName.Name);
            } else {
                echo('\nERRORS ' + fileName.Name);
                processErrors(JSLINT.errors);
                echo('\n');
            }
        }
        
        echo('\n' + i + ' files checked');
    }
    
    function getFilesToProcess(args) {
        var folder,
            i,
            file,
            ext,
            files = [],
            enumerator,
            directory = args.Named.Item('d') || args.Named.Item('directory');

        globals = args.Named.Item('g') || args.Named.Item('globals');
            
        if (directory) {
            echo('scanning files in');
            echo(directory);
            folder = fso.GetFolder(directory);
            enumerator = new Enumerator(folder.Files);

            for (; !enumerator.atEnd(); enumerator.moveNext()) {
                file = enumerator.item();
                ext = file.Name.substring(file.Name.length - 3, file.Name.length);
                if (ext === '.js') {
                    files.push(file);
                } else {
                    echo('skipping ' + file.Name + '; extension not .js');
                }
            }        
        }
        
        for (i = 0; i < args.Unnamed.length; i += 1) {
            file = args.Unnamed.Item(i);
            files.push(file);
        }
        
        return files;
    }
    
    jslint_source = readFile(jslint_path);
    // Yes, this is evil. Is there a better way to load jslint with WSH?
    eval(jslint_source);

    if (args.Count() === 0) {
        echo('You must supply at least one file to test.');
    } else {
        files = getFilesToProcess(args);
        process(files);
    }
}());