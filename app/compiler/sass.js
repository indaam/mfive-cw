const modules = require('../modules');
const { BaseClass } = modules;

class Compiler extends BaseClass {
  getRootFiles(rootPath) {
    const { fs } = this.libs;
    const { isSassFile } = this.func;
    const lists = fs.readdirSync(rootPath);
    return lists.filter((d) => {
      return isSassFile(d);
    });
  }

  getSassOutputExt(fileName, extension) {
    const ext = extension || '.css';
    return fileName.replace(/\.sass|\.scss/g, ext);
  }

  run(watch, file, config) {
    const { msg, err, colors } = this;
    const { cp } = this.libs;
    const sassMain = config.src + '/' + file;
    const sassOutputExt = this.getSassOutputExt(
      file,
      config && config.extension
    );
    const sassOutput = config.destination + '/' + sassOutputExt;
    const argv = ['node_modules/sass/sass.js', sassMain, sassOutput];
    if (watch) {
      argv.push('--watch');
    }
    msg('start sass');
    const sass = cp.spawn(process.argv[0], argv);
    sass.stdout.on('data', function (data) {
      console.log(colors.info('sass:' + file + ' log'));
      console.log(colors.msg('%s'), data);
    });
    sass.stderr.on('data', (data) => {
      console.log(colors.info('sass:' + file + ' log'));
      console.log(colors.err('%s'), data);
    });
  }

  init(watch, config) {
    const sassFile = this.getRootFiles(config.src);

    for (let index = 0; index < sassFile.length; index++) {
      const el = sassFile[index];
      this.run(watch, el, config);
    }
  }
}

module.exports = Compiler;
