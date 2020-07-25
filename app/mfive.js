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

  const getHtmlPath = (config) => {
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        const el = config[key];
        if (el.outputType === 'html') {
          return el.destination;
        }
      }
    }
    return null;
  };

  for (const key in config) {
    if (config.hasOwnProperty(key)) {
      const el = config[key];

      if (el && !el.disable) {
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
  }
  browser.init({
    server: './' + (getHtmlPath(config) || 'dist'),
  });
};

const help = `
  Commands:

  -v, version ... app version
  -h, help ...... show help
  -w, watch ..... watch compiler
  -b, build ..... build & optimize[TODO]
  -i, init ...... create initial(Only for new project)[TODO]

  Options:

  sass .......... compile sass
  js ............ compile js
  pug ........... compile pug
  images ........ compile images
  ts ............ compile typescript

  Example CLI:

  mfive watch ............ watch all
  mfive watch pug sass ... only watch pug & sass
  mfive pug sass ......... only compile pug sass
`;

class Mfive extends BaseClass {
  version() {
    const { dir } = this;
    const packagePath = dir.root + '/package.json';
    const packageJson = require(packagePath);
    return 'v.' + (packageJson && packageJson.version) || null;
  }
  help() {
    const { dir } = this;
    const packagePath = dir.root + '/package.json';
    const packageJson = require(packagePath);
    const packageName = packageJson && packageJson.name;
    const packageVersion = packageJson && packageJson.version;
    return `  ${packageName}(${packageVersion})\n${help}`;
  }
  writeConfigFile(location, content) {
    const { fs } = this.libs;
    try {
      fs.writeFileSync(location, content, 'utf8');
      return 1;
    } catch (error) {
      throw error;
    }
  }

  initConfig(watchList) {
    const { dir } = this;
    const configPath = dir.root + '/mfive.config.json';
    let temp;
    try {
      const mfiveConfig = require(configPath);
      temp = mfiveConfig;
    } catch (error) {
      const conf = new createConfig();
      const configDefault = conf.init('src');
      const configIsWrite = this.writeConfigFile(
        configPath,
        JSON.stringify(configDefault, null, 2)
      );
      if (configIsWrite) {
        temp = configDefault;
      }
    }

    if (watchList === 'all') {
      return temp;
    }

    for (const key in temp) {
      if (temp.hasOwnProperty(key)) {
        if (!watchList.includes(key)) {
          temp[key]['disable'] = true;
        }
      }
    }

    return temp;
  }

  getAssetsWatchDirs(config) {
    const temp = [];
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        const el = config[key];
        if (el.isAssets && !el.disable) {
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
    // run when config avaliable
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        const el = config[key];
        if (compilers && compilers[key] && el && !el.disable) {
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
          console.log(key + ' is not run');
        }
      }
    }

    // Force run when pug disable
    if (watch) {
      for (const key in config) {
        if (config.hasOwnProperty(key)) {
          const el = config[key];
          if (el.outputType === 'html' && el.disable) {
            liveRealod(config);
          }
        }
      }

      this.watchAssets(config);
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

  getWatchList(argv) {
    const supports = ['pug', 'sass', 'images', 'js', 'ts', 'coffe'];
    const temp = [];
    argv.forEach((el) => {
      if (supports.includes(el)) {
        temp.push(el);
      }
    });
    if (temp && temp.length) {
      return temp;
    }
    return 'all';
  }

  init() {
    const { argv } = this;
    const watchList = this.getWatchList(argv.argv);
    const config = this.initConfig(watchList);

    if (argv && argv.help) {
      return console.log(this.help());
    }

    if (argv && argv.version) {
      return console.log(this.version());
    }

    if (argv && argv.clean) {
      return this.clean(config);
    }

    if (argv && argv.browser) {
      return liveRealod(config);
    }

    if (argv && argv.watch) {
      return this.runCompile(config, true);
    }
    if (argv && argv.build) {
      console.log('TODO BUILD');
      const build = true;
      // return this.runCompile(config, true, build);
    }
    return this.runCompile(config, false);
  }
}

module.exports = Mfive;
