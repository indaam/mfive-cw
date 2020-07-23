const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const rollup = require('rollup');
const colors = require('colors/safe');
const prettier = require('prettier');
const chokidar = require('chokidar');

module.exports = {
  chokidar,
  prettier,
  colors,
  fs,
  cp,
  rollup,
  path,
};
