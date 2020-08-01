const BaseClass = require('./baseClass');

class CreateConfig extends BaseClass {
  getFiles(dir) {
    const { path, fs } = this.libs;
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      file = dir + '/' + file;
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.getFiles(file));
      } else {
        results.push(file);
      }
    });
    return results;
  }

  checkFileType(files) {
    const { func } = this;
    const { getFileType } = func;
    for (let index = 0; index < files.length; index++) {
      const el = files[index];
      const fileType = getFileType(el);
      if (fileType) {
        return fileType;
      }
    }
  }

  getDirType(dir) {
    const { func } = this;
    const { path, fs } = this.libs;
    const { getOutputType, checkIsAssests } = func;

    const list = fs.readdirSync(dir);
    const temp = [];

    list.forEach((file) => {
      const fullPath = dir + '/' + file;
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        const files = this.getFiles(fullPath);
        const fileType = this.checkFileType(files);
        temp.push({
          dir: fullPath,
          type: fileType,
          output: getOutputType(fileType),
          isAssets: checkIsAssests(fileType),
        });
      }
    });
    return temp;
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

  create(sourcePath, devPath) {
    const dirType = this.getDirType(sourcePath);
    const temp = {};
    dirType.forEach((el) => {
      temp[el.type] = {
        src: el.dir,
        destination:
          devPath + (el.output === 'html' ? '' : '/assets/' + el.output),
        outputType: el.output,
        isAssets: el.isAssets,
      };
    });
    return temp;
  }

  createConfig(sourcePath, configPath, devPath) {
    const { path, fs } = this.libs;
    const configDefault = this.create(sourcePath, devPath);
    const configIsWrite = this.writeConfigFile(
      path.resolve(configPath),
      JSON.stringify(configDefault, null, 2)
    );

    return (configIsWrite && configDefault) || null;
  }

  init(watchList, CONSTANTS) {
    const { msg } = this;
    const { path, fs } = this.libs;
    let temp;

    const configIsExsist = fs.existsSync(path.resolve(CONSTANTS.configFile));
    const sourceIsExsist = fs.existsSync(path.resolve(CONSTANTS.source));

    if (!configIsExsist && !sourceIsExsist) {
      msg(CONSTANTS.configFile + ' is not exist, please try', 'err');
      msg('mfive init');
      msg('To init project');
      process.exit();
    }

    if (configIsExsist && sourceIsExsist) {
      temp = require(path.resolve(CONSTANTS.configFile));
    }

    if (!configIsExsist && sourceIsExsist) {
      console.log('Source is exist, will create mfive.config.json');
      temp = this.createConfig(
        CONSTANTS.source,
        CONSTANTS.configFile,
        CONSTANTS.dev
      );
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
}

module.exports = CreateConfig;
