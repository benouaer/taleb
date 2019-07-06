var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');
var pkg = require('./package.json');
const nunjucks = require('gulp-nunjucks');


// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

// Compiles SCSS files from /scss into /css
gulp.task('sass', function() {
  return gulp.src('scss/freelancer.scss')
    .pipe(sass())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

// Minify compiled CSS
gulp.task('minify-css', gulp.series('sass', function() {
  return gulp.src('css/freelancer.css')
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }))
}));

// Minify custom JS
gulp.task('minify-js', function() {
  return gulp.src('js/freelancer.js')
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

// Copy vendor files from /node_modules into /vendor
// NOTE: requires `npm install` before running!
gulp.task('copy', function(done) {
  gulp.src([
      'node_modules/bootstrap/dist/**/*',
      '!**/npm.js',
      '!**/bootstrap-theme.*',
      '!**/*.map'
    ])
    .pipe(gulp.dest('vendor/bootstrap'));

  gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('vendor/jquery'));

  gulp.src(['node_modules/popper.js/dist/umd/popper.js', 'node_modules/popper.js/dist/umd/popper.min.js'])
    .pipe(gulp.dest('vendor/popper'));

  gulp.src(['node_modules/jquery.easing/*.js'])
    .pipe(gulp.dest('vendor/jquery-easing'));

    // Font Awesome
  gulp.src(['./node_modules/@fortawesome/**/*'])
    .pipe(gulp.dest('./vendor'));
  done();
});

gulp.task('nunjucks', () =>
  gulp.src('templates/index.html')
    .pipe(nunjucks.compile())
    .pipe(gulp.dest('.'))
);

// Default task
gulp.task('default', gulp.series('sass', 'minify-css', 'minify-js', 'nunjucks', 'copy'));

// Configure the browserSync task
gulp.task('browserSync', function(done) {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
  done();
});

// Dev task with browserSync
gulp.task('dev', gulp.series('browserSync', 'sass', 'minify-css', 'minify-js', 'nunjucks', 'copy', function() {
  gulp.watch('scss/*.scss', gulp.series('sass'));
  gulp.watch('css/*.css', gulp.series('minify-css'));
  gulp.watch('js/*.js', gulp.series('minify-js'));
  gulp.watch('templates/*.html', gulp.series('nunjucks'));
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('templates/*.html', browserSync.reload);
  gulp.watch('js/**/*.js', browserSync.reload);
}));
