const modules = require('../modules');
const { BaseClass } = modules;

class Compiler extends BaseClass {
  constructor() {
    super();
  }
  async svg(_this, path) {
    const { imagemin, imageminSvgo } = _this.libs;
    const res = await imagemin(['sample.svg', 'sample2.svg'], {
      destination: 'public/images',
      plugins: [
        imageminSvgo({
          plugins: [{ removeViewBox: false }],
        }),
      ],
    });
    return res;
  }
  async webp() {
    const { imagemin, imageminWebp } = this.libs;

    const res = await imagemin(['src/images/*.jpg'], {
      destination: 'public/images',
      plugins: [imageminWebp({ quality: 70 })],
    });

    return res;
  }
  async gif() {
    const { imagemin, imageminGiflossy } = this.libs;

    const res = await imagemin(['src/images/gif/*.gif'], {
      destination: 'public/images',
      plugins: [imageminGiflossy({ lossy: 80 })],
    });

    return res;
  }

  async png() {
    const { imagemin, imageminPngquant } = this.libs;

    await imagemin(['src/images/*.png'], {
      destination: 'public/images',
      plugins: [
        imageminPngquant({
          quality: [0.6, 0.8],
        }),
      ],
    });
  }
  async jpg() {
    const { imagemin, imageminMozjpeg } = this.libs;

    await imagemin(['src/images/jpg/*.jpg'], {
      destination: 'public/images',
      plugins: [
        imageminMozjpeg({
          quality: 70,
        }),
      ],
    });
  }

  build(extention, path) {
    const _this = this;
    const bundle = this[extention];
    return bundle(_this, path);
    // this.svg();
  }

  checkDestination(destination) {
    const { fs } = this.libs;
    const exists = fs.existsSync(destination);
    if (!exists) {
      fs.mkdirSync(destination, { recursive: true });
      return true;
    }
    return true;
  }

  init(watch, config, build) {
    const { msg, err, colors } = this;
    const { cp } = this.libs;

    if (build) {
      return this.build(config);
    }

    const imagesSrc = config.src + '/.';
    const fontDestination = config.destination;
    const isHavaDestination = this.checkDestination(fontDestination);

    if (!isHavaDestination) {
      return null;
    }

    msg('start images');
    const images = cp.spawn('cp', ['-rv', imagesSrc, fontDestination]);

    images.stdout.on('data', function (data) {
      console.log(colors.info('images log'));
      console.log(colors.msg('%s'), data);
    });
    images.stderr.on('data', (data) => {
      console.log(colors.info('images log'));
      console.log(colors.err('%s'), data);
    });
  }
}

module.exports = Compiler;
