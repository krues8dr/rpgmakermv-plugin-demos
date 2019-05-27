'use strict'

const gulp = require('gulp');
const imageResize = require('gulp-image-resize');
const path = require('path');
const del = require('del');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const replace = require('gulp-replace');
const clean = require('gulp-clean');

const paths = {
  src: 'img-16/',
  dist: 'img/'
};

function processImages(files) {
    files.pipe(imageResize({
      height: '300%',
      width:  '300%',
      upscale: true
    }))
    .pipe(gulp.dest(paths.dist));
}

gulp.task('image-resize', done => {
  processImages(gulp.src(`${paths.src}**/*.png`));
  done();
});

gulp.task('watch-images', done => {
  let watcher = gulp.watch('img-16/**/*.png', gulp.series(['image-resize']));

  watcher.on('unlink', file => {
    let filePathFromSrc = path.relative(path.resolve(paths.src), file);
    let destFilePath = path.resolve(paths.dist, filePathFromSrc);
    del.sync(destFilePath);
  });
});

const rmmvLibs = [
  'js/libs/pixi.js',
  'js/libs/pixi-tilemap.js',
  'js/libs/pixi-picture.js',
  'js/libs/fpsmeter.js',
  'js/libs/lz-string.js',
  'js/libs/iphone-inline-video.browser.js',
  'js/rpg_core.js',
  'js/rpg_managers.js',
  'js/rpg_objects.js',
  'js/rpg_scenes.js',
  'js/rpg_sprites.js',
  'js/rpg_windows.js',
  // 'js/plugins.js',
  'js/main.js'
];

function doPackage(done) {
  // let time = Buffer.from([Date.now()])
  //   .toString('base64')
  //   .replace(/==$/, '')
  //   .replace('+', '-');
  // let name = 'bundle.' + time + '.js';
  let name = 'bundle.js';

  doPackageClean(function() {
    doPackageUglify(name, function() {
      done();
      // doPackageIndex(name, done);
    });
  });
}

function doPackageClean(done) {
  // return gulp.src('dist',
  return gulp.src('demo/shared/js',
    {read: false, allowEmpty: true})
  .pipe(clean())
  .pipe(gulp.dest('./'))
  .on('end', done);
}

function doPackageUglify(name, done) {
  return gulp.src(rmmvLibs)
  .pipe(concat(name))
  .pipe(uglify())
  // .pipe(gulp.dest('dist'))
  .pipe(gulp.dest('demo/shared/js'))
  .on('end', done);
}

function doPackageIndex(name, done) {
  return gulp.src('index.html', {base: './'})
  .pipe(replace(/bundle\.([a-zA-Z0-9]+)\.js/g, name))
  .pipe(gulp.dest('./'))
  .on('end', done);
}

function doPackageDir(name, done) {
  return gulp.src('dist/'+name, {base: './'})
  .pipe(replace('"img/', '"/demo/shared/img/'))
  .pipe(replace('"audio/', '"/demo/shared/audio/'))
  .pipe(gulp.dest('./'))
  .on('end', done);
}

gulp.task('package', function (done) {
  doPackage(done);
});
