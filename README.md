#gulp-koa#

Wrote this [gulp][0] based on [gulp-koa-service][1] because I wanted a way to pass in env vars. First stab at it so take it easy on me. Also, I realize there's not tests for it (yet).

### Sample ###

```javascript
var gulp = require('gulp'),
    service = require('gulp-koa');
gulp.task('build', function() {
 // your brilliant build goes here
});

gulp.task('server', ['build'], function() {

    // Starts a server
    gulp.src('./src/**/*.js')
        .pipe(service('./build/server.js', { env: { NODE_ENV: 'development', DEBUG: '*' }}));

    // watch your files!
    var watcher = gulp.watch('./src/**/*.js', ['build']);
    watcher.on('change', function(event) {
        console.log(event.path + ' ' + event.type);
        // reload the server
        gulp.src('./src/**/*.js')
            .pipe(service('./build/server.js', { env: { NODE_ENV: 'development', DEBUG: '*' }}));
    });
});

gulp.task('stop', function(){
    // Stops a server (by pid)
    service.stop('./build/server.js');
});
```

[0]: http://gulpjs.com
[1]: https://www.npmjs.com/package/gulp-koa-service