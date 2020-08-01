const BaseClass = require('./baseClass');

class AppInitialize extends BaseClass {
  init(config, CONSTANTS) {
    const { dir, func, msg, warn, colors } = this;
    const { fs, path, cp } = this.libs;

    const packagePath = path.resolve(CONSTANTS.packageFile);
    const templatePath = path.resolve(dir.currentRoot, CONSTANTS.template);
    const targetTemplatePath = path.resolve(dir.root, CONSTANTS.source);

    const targetTemplatePathIsExists = fs.existsSync(targetTemplatePath);
    const packageIsExists = fs.existsSync(packagePath);

    if (!packageIsExists) {
      msg('package.json is not exists, please try', 'err');
      msg('npm init');
      msg('To init npm & create package.json');
      process.exit();
    }

    if (targetTemplatePathIsExists) {
      msg(CONSTANTS.source + ' is exists', 'warn');
      msg('Only can init when ' + CONSTANTS.source + ' not exists', 'warn');
      process.exit();
    }

    console.log(`cp -rv ${templatePath}/. ${targetTemplatePath}/`);

    const copyTempleate = cp.execSync(
      `cp -rv ${templatePath}/. ${targetTemplatePath}/`
    );
    if (copyTempleate) {
      msg('success init ' + CONSTANTS.source + ' to ' + targetTemplatePath);
    }
    return 1;
  }
}

module.exports = AppInitialize;
