const BaseClass = require('../baseClass');

class Copy extends BaseClass {
  checkDestination(destination) {
    const { fs } = this.libs;
    const exists = fs.existsSync(destination);
    if (!exists) {
      fs.mkdirSync(destination, { recursive: true });
      return true;
    }
    return true;
  }

  getConfigFromPath(path, config) {
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        const el = config[key];
        const re = new RegExp('^' + el.src);
        if (re.test(path)) {
          return el;
        }
      }
    }
  }

  cleanPathFromSrc(path, config) {
    const re = new RegExp(config.src);
    return path.replace(re, '');
  }

  init(options) {
    const { msg, err, colors, func } = this;
    const { cp, fs } = this.libs;
    const { path, config, e } = options;
    const { getDirFromPath, getFileFromPath } = func;

    const fileStat = fs.statSync(path);
    if (!fileStat.isFile()) {
      return null;
    }

    const configUse = this.getConfigFromPath(path, config);
    const cleanPath = this.cleanPathFromSrc(path, configUse);

    const destination = configUse.destination + cleanPath;
    const isHavaDestination = this.checkDestination(
      getDirFromPath(destination)
    );

    if (!isHavaDestination) {
      return null;
    }

    msg(e + ' ' + path + ' -> ' + destination);
    const copy = cp.spawn('cp', [path, destination]);

    copy.stdout.on('data', function (data) {});
    copy.stderr.on('data', (data) => {
      console.log(colors.info('fonts log'));
      console.log(colors.err('%s'), data);
    });
  }
}

module.exports = Copy;
