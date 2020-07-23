const BaseClass = require('../baseClass');

class Compiler extends BaseClass {
  getRootFiles(rootPath) {
    const { fs } = this.libs;
    const { isPugFile } = this.func;
    const lists = fs.readdirSync(rootPath);
    return lists
      .filter((d) => {
        return isPugFile(d);
      })
      .map(function (data) {
        return rootPath + '/' + data;
      });
  }

  init(watch, config, callBack) {
    const { msg, err, colors } = this;
    const { cp } = this.libs;

    let pugFiles = this.getRootFiles(config.src);
    const pugLen = pugFiles.length;

    const argv = [
      'node_modules/pug-cli/index.js',
      ...pugFiles,
      '-o',
      config.destination,
    ];

    if (watch) {
      argv.push('-w');
    }

    msg('start pug');
    const pug = cp.spawn(process.argv[0], argv);
    let count = 0;
    pug.stdout.on('data', function (data) {
      const s = data.toString();
      if (/rendered/.test(s)) {
        count++;
      }
      console.log(colors.info('pug log'));
      console.log(colors.msg('%s'), data);
      if (callBack && typeof callBack === 'function') {
        callBack(count, pugLen);
      }
    });

    pug.stderr.on('data', (data) => {
      console.log(colors.info('pug log'));
      console.log(colors.err('%s'), data);
    });
  }
}

module.exports = Compiler;
