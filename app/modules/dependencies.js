const BaseClass = require('./baseClass');

class Dependencies extends BaseClass {
  checkExistDependencies(pkg) {
    const { dir, func } = this;
    const isHaveDevDependencies =
      func.isHaveKey(pkg, 'devDependencies') &&
      !func.isEmptyObject(pkg.devDependencies);

    if (isHaveDevDependencies) {
      return pkg.devDependencies;
    }
    return null;
  }

  getRequireDependencies(config) {
    const dependencies = {
      base: {
        colors: '1.4.0',
        prettier: '2.0.5',
      },
      pug: {
        chokidar: '3.4.1',
        'browser-sync': '2.26.10',
        'pug-cli': 'https://github.com/indaam/pug-cli',
      },
      js: {
        '@babel/core': '7.10.5',
        '@babel/preset-env': '7.10.4',
        'core-js': '3.6.5',
        rollup: '2.22.2',
        'rollup-plugin-babel': '4.4.0',
        'rollup-plugin-commonjs': '^10.1.0',
        'rollup-plugin-includepaths': '0.2.3',
        'rollup-plugin-node-resolve': '^5.2.0',
      },
      sass: {
        sass: '^1.26.10',
      },
    };
    let temp = {};
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        const el = config[key];
        if (dependencies[key]) {
          temp = { ...temp, ...dependencies[key] };
        }
      }
    }
    return temp;
  }

  getMissingDependencies(existDependencies, requireDependencies) {
    const missingDependencies = { ...requireDependencies };
    if (!existDependencies) {
      return missingDependencies;
    }
    for (const key in missingDependencies) {
      if (missingDependencies.hasOwnProperty(key)) {
        for (const k in existDependencies) {
          if (existDependencies.hasOwnProperty(k)) {
            if (key === k) {
              delete missingDependencies[key];
            }
          }
        }
      }
    }
    return missingDependencies;
  }

  spawnPromise(uses) {
    const { cp } = this.libs;
    return new Promise((resolve, reject) => {
      const installDependencies = cp.spawn(uses, ['install']);
      installDependencies.stdout.on('data', (data) => {
        const res = data.toString();
        console.log(res);
        if (/Done(\s)in|found(\s)(\d)/.test(res)) {
          console.log('Install success');
          resolve({
            code: 1,
            msg: res,
          });
        }
      });

      installDependencies.stderr.on('data', (data) => {
        console.log(data.toString());
      });
    });
  }

  async installDependencies(packagePath, pkg, missingDependencies) {
    const { cp, fs } = this.libs;

    pkg['devDependencies'] = {
      ...pkg['devDependencies'],
      ...missingDependencies,
    };

    const spawnWhichYarn = cp.spawnSync('which', ['yarn']);
    const yarnIsExists = !!spawnWhichYarn.stdout.toString();
    const uses = (yarnIsExists && 'yarn') || 'npm';
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2), 'utf8');

    console.log('Wating for install dev dependencies, please wait');
    return await this.spawnPromise(uses);
  }

  async init(config, CONSTANTS) {
    const { dir, func, msg } = this;
    const { fs, path } = this.libs;

    const packagePath = path.resolve(CONSTANTS.packageFile);
    const packageIsExists = fs.existsSync(packagePath);

    if (!packageIsExists) {
      msg('package.json is not exists, please try', 'err');
      msg('npm init');
      msg('To init npm & create package.json');
      process.exit();
    }

    const pkg = require(packagePath);

    const existDependencies = this.checkExistDependencies(pkg);
    const requireDependencies = this.getRequireDependencies(config);
    const missingDependencies = this.getMissingDependencies(
      existDependencies,
      requireDependencies
    );

    if (!func.isEmptyObject(missingDependencies)) {
      console.log('missingDependencies', missingDependencies);
      const instaldep = await this.installDependencies(
        packagePath,
        pkg,
        missingDependencies
      );
      return instaldep;
    }
    return 1;
  }
}

module.exports = Dependencies;
