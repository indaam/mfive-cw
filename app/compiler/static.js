const modules = require('../modules');
const { BaseClass } = modules;

class Compiler extends BaseClass {
  checkDestination(destination) {
    const { fs } = this.libs;
    const exists = fs.existsSync(destination);
    if (!exists) {
      fs.mkdirSync(destination, { recursive: true });
      return true;
    }
    return true;
  }

  init(watch, config) {
    const { msg, err, colors } = this;
    const { cp } = this.libs;

    const staticSource = config.src + '/.';
    const staticDestination = config.destination;
    const isHavaDestination = this.checkDestination(staticDestination);

    if (!isHavaDestination) {
      return null;
    }

    msg('start static');
    const _static = cp.spawn('cp', ['-rv', staticSource, staticDestination]);

    _static.stdout.on('data', function (data) {
      console.log(colors.info('static log'));
      console.log(colors.msg('%s'), data);
    });
    _static.stderr.on('data', (data) => {
      console.log(colors.info('static log'));
      console.log(colors.err('%s'), data);
    });
  }
}

module.exports = Compiler;
