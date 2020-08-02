const libs = require('./libs');
const { path } = libs;

const dir = {
  root: String(process.cwd()).replace(/\s/g, '// '),
  current: String(__dirname).replace(/\s/g, '// '),
  module: path.resolve(__dirname),
  currentRoot: path.resolve(__dirname, '../../'),
};

module.exports = dir;
