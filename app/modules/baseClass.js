const utils = require('../utils');

const { libs, func, argv } = utils;
const { colors, fs, path } = libs;

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
  module: path.resolve(__dirname),
  currentRoot: path.resolve(__dirname, '../../'),
};

const updateArgv = (argv) => {
  if (argv && argv['-v']) {
    argv['version'] = argv['-v'] || true;
  }
  if (argv && argv['-h']) {
    argv['help'] = argv['-h'] || true;
  }
  if (argv && argv['-w']) {
    argv['watch'] = argv['-w'] || true;
  }
  if (argv && argv['-i']) {
    argv['init'] = argv['-i'] || true;
  }
  return argv;
};

class BaseCLass {
  constructor() {
    this.libs = libs;
    this.dir = { ...dir };
    this.argv = updateArgv(argv());
    this.func = func;
    this.colors = colors;
    this.msg = function (msg, type) {
      if (type) {
        return console.log(colors[type](msg));
      }
      return console.log(colors.msg(msg));
    };
    this.err = function (msg) {
      console.log(colors.err(msg));
    };
    this.info = function (msg) {
      console.log(colors.info(msg));
    };
    this.warn = function (msg) {
      console.log(colors.warn(msg));
    };
  }

  // get func() {
  //   return func;
  // }
}

module.exports = BaseCLass;
