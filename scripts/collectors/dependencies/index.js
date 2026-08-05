const fs = require("fs");
const path = require("path");

module.exports = {

  name: "dependencies",

  async collect() {

    const roots = [
      "app",
      "portal-frontend",
      "portal-backend",
      "design-system",
      "design-system/.ds-sync"
    ];

    const projects = [];

    for (const root of roots) {

      const file = path.join(root, "package.json");

      if (!fs.existsSync(file)) continue;

      const pkg = JSON.parse(fs.readFileSync(file, "utf8"));

      projects.push({

        project: root,

        dependencies: Object.keys(pkg.dependencies || {}).length,

        devDependencies: Object.keys(pkg.devDependencies || {}).length,

        optionalDependencies: Object.keys(pkg.optionalDependencies || {}).length,

        peerDependencies: Object.keys(pkg.peerDependencies || {}).length

      });

    }

    return { projects };

  }

};
