const libs = require('./utils/libs');
const func = require('./utils/func');
const { fs } = libs;

class CreateConfig {
  getFiles(dir) {
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
    const { getOutputType, checkIsAssests } = func;
    const list = fs.readdirSync(dir);
    const temp = [];

    list.forEach((file) => {
      file = dir + '/' + file;
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        const files = this.getFiles(file);
        const fileType = this.checkFileType(files);
        temp.push({
          dir: file,
          type: fileType,
          output: getOutputType(fileType),
          isAssets: checkIsAssests(fileType),
        });
      }
    });
    return temp;
  }

  create(path) {
    const dirType = this.getDirType(path);
    const temp = {};
    dirType.forEach((el) => {
      temp[el.type] = {
        src: el.dir,
        destination:
          'dist' + (el.output === 'html' ? '' : '/assets/' + el.output),
        outputType: el.output,
        isAssets: el.isAssets,
      };
    });
    return temp;
  }

  init(path) {
    return this.create(path);
  }
}

module.exports = CreateConfig;
