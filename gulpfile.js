var gulp = require('gulp'),
    babel = require('gulp-babel'),
    zip = require('gulp-zip'),
    shell = require('gulp-shell');

gulp.task('watch', ['build'], function() {
  gulp.watch('./src/*.js', ['build-js']);
  gulp.watch('./src/*.css', ['build-css']);
});

gulp.task('build-js', function() {
  return gulp.src('./src/*.js')
          .pipe(babel())
          .on('error', console.error.bind(console))
          .pipe(gulp.dest('./chrome/data/'))
          .pipe(gulp.dest('./firefox/data/'));
});

gulp.task('build-css', function() {
  return gulp.src('./src/*.css')
          .on('error', console.error.bind(console))
          .pipe(gulp.dest('./chrome/data/'))
          .pipe(gulp.dest('./firefox/data/'));
});

gulp.task('build-data', function() {
  return gulp.src('./images/**/*')
          .on('error', console.error.bind(console))
          .pipe(gulp.dest('./chrome/data/'))
          .pipe(gulp.dest('./firefox/data/'));
});

gulp.task('build', ['build-js', 'build-css', 'build-data']);
gulp.task('dist', ['dist-chrome', 'dist-opera', 'dist-firefox']);

gulp.task('dist-chrome', function() {
  return gulp.src('./chrome/**/*')
          .pipe(zip('chrome.zip'))
          .pipe(gulp.dest('dist'));
});

gulp.task('dist-opera', function() {
  return gulp.src('./opera/**/*')
          .pipe(zip('opera.zip'))
          .pipe(gulp.dest('dist'));
});

gulp.task('dist-opera', function() {
  return gulp.src('./opera/**/*')
          .pipe(zip('opera.zip'))
          .pipe(gulp.dest('dist'));
});

gulp.task('dist-firefox', shell.task([
  'cd firefox && jpm xpi && mv @tips-extension* ../dist/firefox.xpi'
]));