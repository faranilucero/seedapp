var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    plumber = require('gulp-plumber'),
    nodemon = require('gulp-nodemon'),
    reload = browserSync.reload,  
    babel = require("gulp-babel"),
    templateCache = require('gulp-angular-templatecache'),
    concat = require('gulp-concat'),
    addStream = require('add-stream');
    
var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'Safari >= 7',
  'Opera >= 23',
  'iOS >= 7',
  'ChromeAndroid >= 4.4',
  'bb >= 10'
];

var SOURCE = {
  main_scss: 'public/main.scss',
  scss: [
    'public/admin/*.scss',
  ],
  templates: [
    'public/routes/**/*.html',
  ],
  es2015: [
    'public/app.js',
    'public/routes/**/*.js'
  ],
  html: 'public/index.html'
}

var DEST = {
  js: 'public/js/',
  css: 'public/css/'
}

function prepareTemplates() {
  return gulp.src(SOURCE.templates)
    //.pipe(minify and preprocess the template html here)
    .pipe(templateCache({ module:'routerApp'}))
    ;
}

function buildAppjs () {
  return gulp.src(SOURCE.es2015)
    .pipe(concat('app.js', {newLine: '\n\n'}))
    .pipe(babel())
    .pipe(gulp.dest(DEST.js))
    .pipe(reload({ stream: true }))
    ;
}

gulp.task('templates', function() {
  return gulp.src('SOURCE.es2015')
    .pipe(addStream.obj(buildAppjs()))
    .pipe(addStream.obj(prepareTemplates()))
    .pipe(concat('app.js', {newLine: '\n\n'}))
    .pipe(gulp.dest(DEST.js))
    .pipe(reload({ stream: true }));
});


gulp.task('sass', function () {
  gulp.src(SOURCE.main_scss)
  .pipe(plumber())
  .pipe(sass())
  .pipe(autoprefixer({ browsers: AUTOPREFIXER_BROWSERS }))
  .pipe(gulp.dest(DEST.css))
  .pipe(reload({ stream: true }))
  ;
});

gulp.task('html', function() {
  return gulp.src('SOURCE.html')
    .pipe(reload({ stream: true }))
  ;
});

gulp.task('browser-sync', function() {  
  browserSync.init({
    proxy: "localhost:8080"
  });
});

gulp.task('rebuild', function () {
  nodemon({
    script: 'server/server.js'
  , ext: 'js html'
  , env: { 'NODE_ENV': 'development' }
  , nodeArgs: ['--debug']
  });
});


gulp.task('watch-dev', ['sass', 'templates'], function () {
  gulp.watch(SOURCE.scss, ['sass']);
  gulp.watch(SOURCE.templates, ['templates']);
  gulp.watch(SOURCE.es2015, ['templates']);
  gulp.watch(SOURCE.html, ['templates']);
});
