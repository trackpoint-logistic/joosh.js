const { src, dest } = require('gulp');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const rollup = require('gulp-rollup');
const rename = require('gulp-rename');


const BABEL_OPTION = {
	//comments: false,
	//compact: true,
	//minified: true,
	//presets: ["@babel/preset-env"], //ES5
	plugins: ["babel-plugin-loop-optimizer"]

};

const ROLLUP__OPTION = {
	input: './src/main.js',
	output: {
		format: 'cjs'
	}
}

exports.default = function(done) {
	return src('./src/**/*.js')
		.pipe(rollup(ROLLUP__OPTION))
		.pipe(plumber())
		.pipe(babel(BABEL_OPTION))
		.pipe(rename('angular-dashboard-router.js'))
		.pipe(dest('./build'))
  };