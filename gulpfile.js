/*jshint
  expr: true,
  esversion: 6
*/
const gulp = require('gulp');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require("gulp-rename");
const jshint = require('gulp-jshint');
const notify = require("gulp-notify");
const pipeErrorStop = require('pipe-error-stop');

var errorStatus = {css: false,js: false};
var isError = false;
var taskName;

gulp.task('css', function () {
    taskName = 'css';
    return gulp
        .src('./scss/**/*.scss')
        .pipe(sassLint({
          options: {
            formatter: 'stylish',
            'merge-default-rules': false
          }
        }))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
        .on("error", notify.onError(errorHandler))
        .pipe(pipeErrorStop())
        .pipe(sass()
            .on("error", notify.onError(errorHandler))
        )
        .pipe(autoprefixer())
        .pipe(concat('styles.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./css/'))
        .pipe(notify(successHandler));
});

gulp.task('js', function () {
    taskName = 'js';
    return gulp
        .src('./js/scripts.js')
        .pipe(jshint())
        .on("error", notify.onError(errorHandler))
        .pipe(babel({
            presets: ['es2015']
        }))
        .on("error", notify.onError(errorHandler))
        .pipe(uglify())
        .on("error", notify.onError(errorHandler))
        .pipe(rename('scripts.min.js'))
        .pipe(gulp.dest('./js/'))
        .pipe(notify(successHandler));
});


gulp.task('watch', function () {
    gulp.watch('./scss/**/*.scss', ['css']);
    gulp.watch('./js/**/*.js', ['js']);
});

gulp.task('default', ['watch']);

function errorHandler(error) {
    var msg = {
        message: error.message,
        sound: 'Pop'
    };
    if(error.plugin == 'sass-lint' || error.plugin == 'gulp-sass') {
        errorStatus.css = true;
        msg.title = 'CSS Fehler';
        msg.icon = '/Users/christian/Pictures/css.png';
    } else if (error.plugin == 'gulp-babel') {
        errorStatus.js = true;
        msg.title = 'JS Fehler';
        var filename = error.fileName;
            fileName = filename.substr (filename.lastIndexOf('/') + 1, filename.length );
        msg.subtitle = fileName + ' | Line: ' + error.loc.line;
        msg.icon = '/Users/christian/Pictures/js.png';
    }
    return msg;
}

function successHandler() {
    var msg;
    if(errorStatus[taskName]) {
        errorStatus[taskName] = false;
        msg = {
            wait: true,
            timeout: 1,
            title: taskName.toUpperCase() + '-Fehler Behoben!',
            message: 'Fehler behoben!',
            sound: 'Hero',
            icon: '/Users/christian/Pictures/' + taskName + '.png' 
        };
    } else {
        msg = false;
    }
    return msg;
}