const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

const uglifyes = require('uglify-es');
const composer = require('gulp-uglify/composer');
const uglify = composer(uglifyes, console);

const {release} = require("gulp-release-it");
release(gulp);

gulp.task("default", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js
        // .pipe(uglify())
        .pipe(gulp.dest("dist"))
        ;
});

gulp.task("compress", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js
        .pipe(uglify())
        .pipe(gulp.dest("dist"))
        ;
});