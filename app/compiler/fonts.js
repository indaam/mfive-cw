const BaseClass = require('../baseClass');

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

    const fontSrc = config.src + '/.';
    const fontDestination = config.destination;
    const isHavaDestination = this.checkDestination(fontDestination);

    if (!isHavaDestination) {
      return null;
    }

    msg('start fonts');
    const fonts = cp.spawn('cp', ['-rv', fontSrc, fontDestination]);

    fonts.stdout.on('data', function (data) {
      console.log(colors.info('fonts log'));
      console.log(colors.msg('%s'), data);
    });
    fonts.stderr.on('data', (data) => {
      console.log(colors.info('fonts log'));
      console.log(colors.err('%s'), data);
    });
  }
}

module.exports = Compiler;
