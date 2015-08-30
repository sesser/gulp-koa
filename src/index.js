var through = require('through2'),
	gutil = require('gulp-util'),
	merge = require('deepmerge'),
	PluginError = gutil.PluginError,
	spawn = require('child_process').spawn,
	debug = require('debug')('gulp-koa'),
	fs = require('fs'),
	path = require('path'),
	info = gutil.colors.cyan,
	error = gutil.colors.bold.red,
	dbg = gutil.colors.gray,
	server = null;



module.exports = function(script, options) {
	if (!script || typeof(script) !== "string") {
		debug(error('No script file passed or script is not a string'))
		throw new PluginError('gulp-koa', 'Missing or invalid script for gulp-koa', {showProperties: false});
	}
	fs.exists(script, function(exists) {
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
	return through.obj(function() {
		if (server && server.kill) {
			debug(info('Server is already running: ') + dbg(server.pid || 0));
			server.kill('SIGTERM');
			server = null;
		}
		
		debug(info('Spawning new server with: ' + script));

		server = spawn('node', ['--harmony', script], opts);
	});
}