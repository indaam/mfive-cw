const getLastArray = (arr) => {
  if (arr && arr.length) {
    return arr[arr.length - 1];
  }
};

const camelCaseToDash = (str) => {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

const isExtention = (ext, path) => {
  let re = '^[^.]+' + ext + '$';
  re = new RegExp(re);
  return re.test(path);
};

const isPugFile = (path) => {
  return isExtention('.pug', path);
};

const getFileFromPath = (path) => {
  return getLastArray(path.split('/'));
};

const isJsFile = (path) => {
  return isExtention('.js', path);
};
const isSassFile = (path) => {
  return isExtention('.scss', path) || isExtention('.sass', path);
};
const isTsFile = (path) => {
  return isExtention('.ts', path);
};

const isImageFile = (path) => {
  return (
    isExtention('.png', path) ||
    isExtention('.jpg', path) ||
    isExtention('.jpeg', path) ||
    isExtention('.svg', path) ||
    isExtention('.gif', path)
  );
};

const isFontFile = (path) => {
  if (/font/.test(path)) {
    return true;
  }
  return isExtention('.ttf', path) || isExtention('.woff', path);
};

const isCoffeFile = (path) => {
  return isExtention('.coffe', path);
};

const getFileType = (path) => {
  const lists = {
    js: isJsFile(path),
    ts: isTsFile(path),
    coffe: isCoffeFile(path),
    sass: isSassFile(path),
    images: isImageFile(path),
    fonts: isFontFile(path),
    pug: isPugFile(path),
  };

  for (const key in lists) {
    if (lists.hasOwnProperty(key)) {
      const el = lists[key];
      if (el) {
        return key;
      }
    }
  }
  return null;
};

const getOutputType = (extention) => {
  if (/pug/.test(extention)) {
    return 'html';
  }

  if (/scss|sass/.test(extention)) {
    return 'css';
  }
  if (/fonts/.test(extention)) {
    return 'fonts';
  }

  if (/js|ts|coffe/.test(extention)) {
    return 'js';
  }

  return extention;
};
const checkIsAssests = (extention) => {
  if (['scss', 'sass', 'pug', 'js', 'ts', 'coffe'].includes(extention)) {
    return false;
  }
  return true;
};

const getDirFromPath = (path) => {
  let d = path.split('/');
  d.pop();
  return d.join('/');
};

const createArgv = (data, extra) => {
  if (!data) {
    return null;
  }

  if (typeof data === 'string') {
    return data.split(' ');
  }

  const temp = [];
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const el = data[key];
      temp.push(extra + key);

      if (el && typeof el !== 'boolean') {
        temp.push(el);
      }
    }
  }
  return temp;
};

module.exports = {
  createArgv,
  getFileFromPath,
  checkIsAssests,
  getOutputType,
  getFileType,
  isPugFile,
  isCoffeFile,
  isFontFile,
  isImageFile,
  isJsFile,
  isTsFile,
  isSassFile,
  getLastArray,
  camelCaseToDash,
  isExtention,
  getDirFromPath,
};
