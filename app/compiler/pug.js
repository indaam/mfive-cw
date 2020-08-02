const modules = require('../modules');
const { BaseClass } = modules;

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
    const { msg, err, colors, func } = this;
    const { cp } = this.libs;
    const extraArgv = func.createArgv(config && config.argv, '');

    let pugFiles = this.getRootFiles(config.src);

    const pugLen = pugFiles.length;

    let argv = [
      'node_modules/pug-cli/index.js',
      ...pugFiles,
      '-o',
      config.destination,
    ];

    if (watch) {
      argv.push('-w');
    }

    if (extraArgv) {
      argv = [...argv, ...extraArgv];
    }

    msg('start pug');
    const pug = cp.spawn(process.argv[0], argv);
    let count = 0;
    let countRender = 0;
    let isInit = false;
    pug.stdout.on('data', function (data) {
      count++;
      const s = data.toString();
      if (/rendered/.test(s)) {
        countRender++;
      }
      console.log(colors.info('pug log'));
      console.log(colors.msg('%s'), data);
      if (callBack && typeof callBack === 'function') {
        callBack(
          {
            config: config,
            count: count,
            countRender: countRender,
            pugLen: pugLen,
            isInit: isInit,
          },
          pug
        );
      }
      isInit = true;
    });

    pug.stderr.on('data', (data) => {
      console.log(colors.info('pug log'));
      console.log(colors.err('%s'), data);
    });

    pug.on('close', function (code) {
      isInit = false;
      count = 0;
      countRender = 0;
      console.log(colors.info('Pug is close : Add new file'));
      console.log(colors.info('Save your new file'));
    });
  }
}

module.exports = Compiler;
