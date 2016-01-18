var gulp = require('gulp');
var jasmine = require('gulp-jasmine-phantom');
var browserify = require('browserify');
var source = require('vinyl-source-stream');


var paths = {
    scripts: ['Scripts/dist/**/*.js']
};

gulp.task('browserify', function () {
    return browserify('Scripts/app/app.js')
        .bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('htmlgen.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('Scripts/app/output'));
});

gulp.task('unit-tests', function () {
    return gulp
        .src('Scripts/tests/**/*.js')
            .pipe(jasmine());
});


// Rerun the task when a file changes 
gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['unit-tests']);
    gulp.watch(paths.scripts, ['browserify']);
});

// The default task (called when you run `gulp` from cli) 
gulp.task('default', ['watch']);