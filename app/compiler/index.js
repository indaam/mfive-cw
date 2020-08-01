const JsCompiler = require('./js');
const TsCompiler = require('./ts');
const PugCompiler = require('./pug');
const SassCompiler = require('./sass');
const ImagesCompiler = require('./images');
const FontsCompiler = require('./fonts');
const Copy = require('./copy');
const StaticCompiler = require('./static');

module.exports = {
  JsCompiler,
  TsCompiler,
  PugCompiler,
  SassCompiler,
  ImagesCompiler,
  FontsCompiler,
  Copy,
  StaticCompiler,
};
