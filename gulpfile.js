var gulp = require('gulp');
var jasmine = require('gulp-jasmine-phantom');

var paths = {
    scripts: ['Scripts/tests/**/*.js']
};

gulp.task('unit-tests', function () {
    return gulp
        .src('Scripts/tests/**/*.js')
            .pipe(jasmine());
});


// Rerun the task when a file changes 
gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['unit-tests']);
});

// The default task (called when you run `gulp` from cli) 
gulp.task('default', ['watch']);