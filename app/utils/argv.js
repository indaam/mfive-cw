const p = process;

const cleanString = (str, claener) => {
  return str.replace(claener, '');
};

const isNumeric = (value) => {
  return /^-{0,1}\d+$/.test(value);
};

const parseJson = (val) => {
  try {
    return JSON.parse(val);
  } catch (error) {
    return null;
  }
};

const validateValue = (value) => {
  if (isNumeric(value)) {
    return Number(value);
  }
  // Allowed type object, array, boolean
  if (parseJson(value) !== null) {
    return parseJson(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  return true;
};

const strToKeyValue = (str, replacer, clean) => {
  const arr = str.split(replacer);
  return {
    key: cleanString(arr[0], clean),
    value: validateValue(arr[1]),
  };
};

const argvToObject = (process) => {
  const { argv } = process || p;
  const temp = {
    argv: argv,
  };
  for (let index = 0; index < argv.length; index++) {
    const el = argv[index];
    const keyValue = strToKeyValue(el, '=', '');
    if (index === 0) {
      temp['node'] = el;
    } else if (index === 1) {
      temp['current'] = el;
    } else {
      temp[keyValue['key']] = keyValue['value'];
    }
  }
  return temp;
};

module.exports = argvToObject;
