var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jasmine = require('gulp-jasmine');

gulp.task('lint', function() {
  return gulp.src(['main.js', 'spec/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }))
    .pipe(jshint.reporter('fail'));
});

gulp.task('test', ['lint'], function() {
  return gulp.src('spec/test.js')
    .pipe(jasmine({ verbose: true }));
});

gulp.task('default', ['lint', 'test']);

