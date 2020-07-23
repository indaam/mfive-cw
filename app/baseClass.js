const utils = require('./utils');
const { libs, argv, func } = utils;
const { colors, fs } = libs;

colors.setTheme({
  msg: ['brightCyan', 'bold'],
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: ['green', 'bold'],
  data: 'grey',
  help: 'cyan',
  warn: ['yellow', 'bold'],
  debug: 'blue',
  err: ['red', 'bold'],
});

const dir = {
  root: String(process.cwd()).replace(/\s/g, '// '),
  current: String(__dirname).replace(/\s/g, '// '),
};

class BaseCLass {
  constructor() {
    this.libs = libs;
    this.dir = { ...dir };
    this.argv = { ...argv };
    this.func = func;
    this.colors = colors;
    this.msg = function (msg) {
      console.log(colors.msg(msg));
    };
    this.err = function (msg) {
      console.log(colors.err(msg));
    };
    this.info = function (msg) {
      console.log(colors.info(msg));
    };
  }

  // get func() {
  //   return func;
  // }
}

module.exports = BaseCLass;
