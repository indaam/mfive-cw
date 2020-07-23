const BaseClass = require('./baseClass');
const compiler = require('./compiler');
const createConfig = require('./createConfig');

const bs = require('browser-sync');

const {
  JsCompiler,
  TsCompiler,
  PugCompiler,
  SassCompiler,
  ImagesCompiler,
  FontsCompiler,
  Copy,
} = compiler;

const compilers = {
  images: new ImagesCompiler(),
  fonts: new FontsCompiler(),
  sass: new SassCompiler(),
  pug: new PugCompiler(),
  js: new JsCompiler(),
  copy: new Copy(),
};

const liveRealod = (config) => {
  const browser = bs.create();

  for (const key in config) {
    if (config.hasOwnProperty(key)) {
      const el = config[key];

      if (el.outputType === 'html') {
        console.log('setup ' + el.outputType);
        const patterns = el.destination + '/*.' + el.outputType;
        browser.watch(patterns).on('change', function (e, f) {
          console.log('reload ' + el.outputType);
          browser.reload();
        });
      } else if (['js', 'css'].includes(el.outputType)) {
        console.log('setup ' + el.outputType);
        const patterns = el.destination + '/*.' + el.outputType;
        browser.watch(patterns).on('change', function (e, f) {
          console.log('reload ' + el.outputType);
          browser.reload('*.' + el.outputType);
        });
      } else {
        console.log('setup ' + el.outputType);
        const patterns = el.destination + '/**';
        browser.watch(patterns).on('change', function (e, f) {
          console.log('reload ' + el.outputType);
          browser.reload();
        });
      }
    }
  }
  browser.init({
    server: './dist',
  });
};

class Mfive extends BaseClass {
  writeConfigFile(location, content) {
    const { fs } = this.libs;
    try {
      fs.writeFileSync(location, content, 'utf8');
      return 1;
    } catch (error) {
      throw error;
    }
  }

  initConfig() {
    const { dir } = this;
    const configPath = dir.root + '/mfive.config.json';
    try {
      const mfiveConfig = require(configPath);
      return mfiveConfig;
    } catch (error) {
      const conf = new createConfig();
      const configDefault = conf.init('src');
      const configIsWrite = this.writeConfigFile(
        configPath,
        JSON.stringify(configDefault, null, 2)
      );
      if (configIsWrite) {
        return configDefault;
      }
    }
  }

  getAssetsWatchDirs(config) {
    const temp = [];
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        const el = config[key];
        if (el.isAssets) {
          temp.push(el.src);
        }
      }
    }
    return temp;
  }

  watchAssets(config) {
    const { chokidar } = this.libs;
    const watchDirs = this.getAssetsWatchDirs(config);

    chokidar
      .watch(watchDirs, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true,
      })

      // .on('all', (event, path) => {
      .on('add', (path) => {
        compilers.copy.init({
          e: 'add',
          path: path,
          config: config,
        });
      })
      .on('change', (path) => {
        compilers.copy.init({
          e: 'change',
          path: path,
          config: config,
        });
      });
  }

  runCompile(config, watch) {
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        const el = config[key];
        if (compilers && compilers[key]) {
          const compiler = compilers[key];

          if (el.outputType === 'html') {
            compiler.init(watch, el, (count, pugLen) => {
              if (count === pugLen && watch) {
                liveRealod(config);
              }
            });
          } else {
            compiler.init(watch, el);
          }
        } else {
          console.log(key + ' is not setup');
        }
      }
    }
  }

  cleanBuild(type, config) {
    const { cp, fs } = this.libs;
    const { msg } = this;
    if (fs.existsSync(config.destination)) {
      const stat = fs.statSync(config.destination);
      if (stat.isDirectory()) {
        msg('Clean ' + config.destination);
        cp.spawn('rm', ['-rf', config.destination]);
        return type;
      }
    }
    return type;
  }

  clean(config) {
    const temp = [];
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        const el = config[key];
        if (compilers && compilers[key]) {
          const clean = this.cleanBuild(key, el);
          temp.push(clean);
        }
      }
    }
    return temp;
  }

  init() {
    const { argv } = this;
    const config = this.initConfig();

    if (argv && argv.clean) {
      return this.clean(config);
    }

    if (argv && argv.browser) {
      return this.liveRealod(config);
    }

    if (argv && argv.watch) {
      // const clean = this.clean(config);
      // if (clean) {
      this.runCompile(config, true);
      this.watchAssets(config);
      // }
    } else {
      // const clean = this.clean(config);
      // if (clean) {
      this.runCompile(config, false);
      // }
    }
    if (argv && argv.build) {
      console.log('TODO BUILD');
    }
  }
}

module.exports = Mfive;
