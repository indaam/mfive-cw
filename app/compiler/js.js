const modules = require('../modules');
const { BaseClass } = modules;

class Compiler extends BaseClass {
  getRootFiles(rootPath) {
    const { fs } = this.libs;
    const { isJsFile } = this.func;
    const lists = fs.readdirSync(rootPath);
    return lists.filter((d) => {
      return isJsFile(d);
    });
  }

  createConfigName(jsfile) {
    return 'rollup' + jsfile.replace('.', '');
  }

  rollupDefaultConfig(config, jsfile) {
    const rollupConfig = `{
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
      ]
    };`;

    return {
      name: this.createConfigName(jsfile),
      configDependencies: null,
      rollupConfig: rollupConfig,
    };
  }

  rollupReactConfig(config, jsfile) {
    const { cp } = this.libs;
    const { msg } = this;

    const reactDependencies = ['react', 'react-dom'];
    const reactDevDependencies = [
      '@babel/plugin-proposal-decorators',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/preset-env',
      '@babel/preset-react',
      'babel-plugin-transform-class-properties',
    ];

    const addReactDependencies = cp.execSync(
      'yarn add ' + reactDependencies.join(' ')
    );
    msg('Done Add React Dependencies' + addReactDependencies);
    const addReactDevDependencies = cp.execSync(
      'yarn add -D ' + reactDevDependencies.join(' ')
    );
    msg('Done Add React Dev Dependencies' + addReactDevDependencies);
    const rollupConfig = `{
      input: '${config.src}/${jsfile}',
      output: {
        dir: '${config.destination}',
        format: 'iife',
        sourcemap: true,
        banner: 'var process = {env: { NODE_ENV: "development"} };',
      },
      watch: {
        include: '${config.src}/**',
        chokidar: {
          useFsEvents: false,
        },
      },
      context: 'window',
      plugins: [
        commonjs({
          include: 'node_modules/**',
          browser: true,
        }),
        babel({
          babelrc: false,
          configFile: false,
          envName: 'development',
          presets: ['@babel/preset-env', '@babel/preset-react'],
          exclude: 'node_modules/**',
          plugins: [
            'transform-class-properties',
            '@babel/plugin-proposal-object-rest-spread',
            [
              '@babel/plugin-proposal-decorators',
              {
                legacy: true,
              },
            ],
            '@babel/plugin-syntax-dynamic-import',
          ],
        }),
        resolve(),
      ],
    };`;

    return {
      name: this.createConfigName(jsfile),
      configDependencies: [
        "const commonjs = require('rollup-plugin-commonjs');",
      ],
      rollupConfig: rollupConfig,
    };
  }

  createRollupConfig(baseConfigDependencies, configFileLists) {
    let baseConfig = '';
    let fileConfig = '';
    const configName = [];
    configFileLists.forEach((el) => {
      if (el && el.configDependencies && el.configDependencies.length) {
        el.configDependencies.forEach((element) => {
          baseConfigDependencies.push(element);
        });
        baseConfigDependencies.concat(el.configDependencies);
      }
      fileConfig += `const ${el.name} = ${el.rollupConfig}`;
      configName.push(el.name);
    });

    baseConfig += baseConfigDependencies.join('');
    return `${baseConfig}${fileConfig} module.exports = ${
      configFileLists.length === 1
        ? configName[0]
        : '[' + configName.join(', ') + ']'
    }`;
  }

  getRollupConfig(config, jsfile) {
    const baseConfigDependencies = [
      "const includePaths = require('rollup-plugin-includepaths');",
      "const resolve = require('rollup-plugin-node-resolve');",
      "const babel = require('rollup-plugin-babel');",
    ];
    const configFileLists = [];

    jsfile.forEach((el) => {
      if (/react/.test(el)) {
        configFileLists.push(this.rollupReactConfig(config, el));
      } else {
        configFileLists.push(this.rollupDefaultConfig(config, el));
      }
    });
    return this.createRollupConfig(baseConfigDependencies, configFileLists);
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
      const mfiveRollupConfig = require(dir.root + '/' + location);
      if (mfiveRollupConfig.length === jsFile.length) {
        return 1;
      } else {
        if (
          typeof mfiveRollupConfig === 'object' &&
          mfiveRollupConfig.hasOwnProperty('input') &&
          jsFile.length === 1
        ) {
          return 1;
        }
      }
      info('ReCreate rollup config' + location);
      return this.writeRollupConfig(location, content);
    } else {
      return this.writeRollupConfig(location, content);
    }
  }

  init(watch, config) {
    const { msg, err, colors, func } = this;
    const { cp } = this.libs;
    const jsFile = this.getRootFiles(config.src);
    const extraArgv = func.createArgv(config && config.argv, '');

    const rollupConfig = this.getRollupConfig(config, jsFile);
    const rollupConfigFile = 'mfive.js.rollup.js';

    const isHaveConfig = this.checkRollupConfig(
      rollupConfigFile,
      rollupConfig,
      jsFile
    );

    let argv = ['node_modules/rollup/dist/bin/rollup', '-c', rollupConfigFile];

    if (watch) {
      argv.push('--no-watch.clearScreen');
      argv.push('-w');
    }

    if (extraArgv) {
      argv = [...argv, ...extraArgv];
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
