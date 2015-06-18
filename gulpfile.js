var gulp = require("gulp"),
    babel = require("gulp-babel");

gulp.task("watch", function() {
    gulp.watch("./chrome/dev/*.js", function(file) {
        gulp.src(file.path)
            .pipe(babel())
            .on("error", console.error.bind(console))
            .pipe(gulp.dest("./chrome/build"));
    });
});