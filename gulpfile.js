var gulp = require('gulp'),
    babel = require('gulp-babel');

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
