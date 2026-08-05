const system = require('../collectors/system');
const git = require('../collectors/git');
const project = require('../collectors/project');
const dependencies = require('../collectors/dependencies');
const build = require('../collectors/build');
const cache = require('../collectors/cache');
const files = require('../collectors/files');
const docs = require('../collectors/docs');
const security = require('../collectors/security');

module.exports = {
  all() {
    return [
      system,
      git,
      project,
      dependencies,
      build,
      cache,
      files,
      docs,
      security
    ];
  }
};
