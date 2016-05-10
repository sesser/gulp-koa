var through = require('through2'),
    gutil = require('gulp-util'),
    merge = require('deepmerge'),
    PluginError = gutil.PluginError,
    spawn = require('child_process').spawn,
    debug = require('debug')('gulp-koa'),
    fs = require('fs'),
    tmpdir = require('os-tmpdir')(),
    mkdirp = require('mkdirp'),
    path = require('path'),
    info = gutil.colors.cyan,
    error = gutil.colors.bold.red,
    dbg = gutil.colors.gray,
    server = null;


function stop(script) {
    if (server && server.kill) {
        debug(info('Server is already running: ') + dbg(server.pid || 0));
        server.kill('SIGTERM');
        server = null;
    } else if (!server) {
        var pidPath = getPidPathFor(script);
        if(fs.existsSync(pidPath)){
            var pid = fs.readFileSync(pidPath, 'utf8') | 0; //read pid and convert it to int
            console.log('send SIGTERM to pid ' + pid);
            process.kill(pid);
        };
    }
}

function getPidPathFor(script) {
    return path.join(tmpdir, 'gulp-koa', path.dirname(script), path.basename(script) + ".pid");
}

module.exports = function (script, options) {
    if (!script || typeof(script) !== "string") {
        debug(error('No script file passed or script is not a string'))
        throw new PluginError('gulp-koa', 'Missing or invalid script for gulp-koa', {showProperties: false});
    }
    fs.exists(script, function (exists) {
        if (!exists) {
            debug(error('Script file does not exist. ') + dbg(script));
            throw new PluginError('gulp-koa', 'Script file does not exist (' + info(script) + ')', {showProperties: false});
        }
    });
    options = options || {};
    var opts = merge({
        cwd: undefined,
        env: process.env,
        stdio: 'inherit'
    }, options);
    return through.obj(function () {
        stop(script);
        debug(info('Spawning new server with: ' + script));
        server = spawn('node', ['--harmony', script], opts);
        var pidPath = getPidPathFor(script);
        mkdirp.sync(path.dirname(pidPath));
        fs.writeFileSync(pidPath, server.pid.toString());
        console.log('write pid ' + server.pid + ' to ' + pidPath);
        server.on('exit', function(code){
            console.log('Koa has stopped with exit code ' + code);
            fs.unlinkSync(pidPath);
        });
    });
}

module.exports.stop = stop;
