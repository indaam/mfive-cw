const BaseClass = require('../baseClass');

class Compiler extends BaseClass {
  getRootFiles(rootPath) {
    const { fs } = this.libs;
    const { isJsFile } = this.func;
    const lists = fs.readdirSync(rootPath);
    return lists.filter((d) => {
      return isJsFile(d);
    });
  }

  rollupConfig(config, jsfile) {
    return `
    {
      input: '${config.src}/${jsfile}',
      output: {
        dir: '${config.destination}',
        format: 'iife',
        sourcemap: true,
        banner: \`/* Last compile at \${new Date().toLocaleString()} */ \`,
        globals: {
          jQuery: '$',
        },
      },
      watch: {
        include: '${config.src}/**',
        chokidar: {
          useFsEvents: false,
        },
      },
      context: 'window',
      plugins: [
        includePaths({ paths: ['./'] }),
        babel({
          babelrc: false,
          configFile: false,
          presets: ['@babel/preset-env'],
          exclude: 'node_modules/**',
          externalHelpers: true,
        }),
        resolve(),
      ],
    }
    `;
  }

  createRollupConfig(config, jsfile) {
    const before = `
    const includePaths = require('rollup-plugin-includepaths');
    const resolve = require('rollup-plugin-node-resolve');
    const babel = require('rollup-plugin-babel');
    module.exports =
    `;

    const temp = [];
    jsfile.forEach((el) => {
      temp.push(this.rollupConfig(config, el));
    });

    return (
      before + (jsfile.length === 1 ? temp[0] : '[' + temp.join(',') + ']')
    );
  }

  writeRollupConfig(location, content) {
    const { info } = this;
    const { fs, prettier } = this.libs;
    try {
      const contentJs = prettier.format(content, {
        jsxBracketSameLine: true,
        printWidth: 80,
        singleQuote: true,
        tabWidth: 2,
      });
      fs.writeFileSync(location, contentJs, 'utf8');
      info('Create rollup config' + location);
      return 1;
    } catch (error) {
      throw error;
    }
  }

  checkRollupConfig(location, content, jsFile) {
    const { info, dir } = this;
    const { fs } = this.libs;
    if (fs.existsSync(location)) {
      info(location + ' is exists');
      const confLen = require(dir.root + '/' + location);
      if (confLen.length === jsFile.length) {
        return 1;
      }
      info('ReCreate rollup config' + location);
      return this.writeRollupConfig(location, content);
    }
    return this.writeRollupConfig(location, content);
  }

  init(watch, config) {
    const { msg, err, colors } = this;
    const { cp } = this.libs;
    const jsFile = this.getRootFiles(config.src);
    const rollupConfig = this.createRollupConfig(config, jsFile);
    const rollupConfigFile = 'mfive.js.rollup.js';

    const isHaveConfig = this.checkRollupConfig(
      rollupConfigFile,
      rollupConfig,
      jsFile
    );

    const argv = [
      'node_modules/rollup/dist/bin/rollup',
      '-c',
      rollupConfigFile,
    ];

    if (watch) {
      argv.push('--no-watch.clearScreen');
      argv.push('-w');
    }

    if (isHaveConfig) {
      msg('start js');
      const js = cp.spawn(process.argv[0], argv);

      js.stdout.on('data', function (data) {
        // console.log(colors.info('js log'));
        // console.log(colors.msg('%s'), data);
      });
      js.stderr.on('data', (data) => {
        console.log(colors.info('js log'));
        const s = data.toString();
        if (/created(\s)/.test(s)) {
          console.log(colors.msg('%s'), data);
        } else {
          // console.log('%s', data);
          console.log(colors.warn('%s'), data);
        }
      });
    }
  }
}

module.exports = Compiler;
