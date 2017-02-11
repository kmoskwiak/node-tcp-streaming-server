var gulp = require('gulp');
var server = require('gulp-develop-server');
var gutil = require('gulp-util');

gulp.task('default', [ 'server:start', 'server:restart' ], function() {
  
});

// run server 
gulp.task( 'server:start', function() {
    gutil.log('Starting sever');
    server.listen( { path: './server/app.js' } );
});

gulp.task( 'server:restart', function(event) {
    gulp.watch('./server/**/*.js', server.restart );
});