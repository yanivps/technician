var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();

// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', function() {
  return new Promise(function(resolve, reject) {
    // Bootstrap
    gulp.src([
        './vendor/bootstrap-rtl/**/*',
      ])
      .pipe(gulp.dest('./dist/vendor/bootstrap-rtl'))

    // Fancybox
    gulp.src([
        './vendor/fancybox/**/*',
      ])
      .pipe(gulp.dest('./dist/vendor/fancybox'))

    // iticons
    gulp.src([
        './vendor/iticons/**/*',
      ])
      .pipe(gulp.dest('./dist/vendor/iticons'))

    // Devicons
    gulp.src([
        './node_modules/devicons/**/*',
        '!./node_modules/devicons/*.json',
        '!./node_modules/devicons/*.md',
        '!./node_modules/devicons/!PNG',
        '!./node_modules/devicons/!PNG/**/*',
        '!./node_modules/devicons/!SVG',
        '!./node_modules/devicons/!SVG/**/*'
      ])
      .pipe(gulp.dest('./dist/vendor/devicons'))

    // Font Awesome
    gulp.src([
        './node_modules/font-awesome/**/*',
        '!./node_modules/font-awesome/{less,less/*}',
        '!./node_modules/font-awesome/{scss,scss/*}',
        '!./node_modules/font-awesome/.*',
        '!./node_modules/font-awesome/*.{txt,json,md}'
      ])
      .pipe(gulp.dest('./dist/vendor/font-awesome'))

    // jQuery
    gulp.src([
        './node_modules/jquery/dist/*',
        '!./node_modules/jquery/dist/core.js'
      ])
      .pipe(gulp.dest('./dist/vendor/jquery'))

    // jQuery Easing
    gulp.src([
        './node_modules/jquery.easing/*.js'
      ])
      .pipe(gulp.dest('./dist/vendor/jquery-easing'))

    // Simple Line Icons
    gulp.src([
        './node_modules/simple-line-icons/fonts/**',
      ])
      .pipe(gulp.dest('./dist/vendor/simple-line-icons/fonts'))

    gulp.src([
        './node_modules/simple-line-icons/css/**',
      ])
      .pipe(gulp.dest('./dist/vendor/simple-line-icons/css'))
    resolve();
  });
});

// Delete compiled css
gulp.task('css:deleteCompiled', function () {
  return del(['./scss/*.css']);
});

// Compile SCSS
gulp.task('css:compile', function() {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(gulp.dest('./scss'))
});

// Minify CSS
gulp.task('css:minify', gulp.series('css:compile', function() {
  return gulp.src([
      './scss/*.css',
      './css/*.css',
      '!./css/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream());
}));

// CSS
gulp.task('css', gulp.series('css:compile', 'css:minify', 'css:deleteCompiled'));

// Minify JavaScript
gulp.task('js:minify', function() {
  return gulp.src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.stream());
});

// JS
gulp.task('js', gulp.series('js:minify'));

gulp.task('fonts', function() {
  return gulp.src('fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

gulp.task('images', function() {
  gulp.src('img/**/*')
  .pipe(gulp.dest('dist/img'))

  return gulp.src('favicon.ico')
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream())
});

gulp.task('html', function() {
  return gulp.src('index.html')
  .pipe(gulp.dest('dist'))
});

// Default task
gulp.task('default', gulp.parallel('css', 'js', 'vendor', 'fonts', 'images', 'html'));

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: "./dist",
    }
  });
});

// BrowserSync Reload
function browserSyncReload(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
  gulp.watch('./scss/*.scss', gulp.series('css'));
  gulp.watch('./js/*.js', gulp.series('js'));
  gulp.watch('./img/**/*', gulp.series('images'));
  gulp.watch('./*.html', gulp.series('html', browserSyncReload));
}

// Dev task
gulp.task('dev', gulp.parallel('default', 'browserSync', watchFiles));
