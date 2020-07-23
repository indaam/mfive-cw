const { argv } = process;

const cleanString = (str, claener) => {
  return str.replace(claener, '');
};

const strToKeyValue = (str, replacer, clean) => {
  const strArr = str.split(replacer);
  return { key: cleanString(strArr[0], clean), value: strArr[1] };
};

const getArgv = () => {
  const temp = {};
  for (let index = 0; index < argv.length; index++) {
    const element = argv[index];
    const keyValue = strToKeyValue(element, '=', '--');
    if (index === 0) {
      temp['which'] = element;
    } else if (index === 1) {
      temp['current'] = element;
    } else {
      temp[keyValue['key']] = keyValue['value'] || true;
    }
  }
  return temp;
};

module.exports = getArgv();
