const Runner = require('./runner');
const registry = require('./registry');
const config = require('../config');

(async () => {
    console.clear();

    console.log("");
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║                  DODÔ PROJECT HEALTH REPORT                 ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");
    console.log("");

    console.log(`Projeto : ${config.projectName}`);
    console.log(`Versão  : ${config.version}`);
    console.log(`Data    : ${new Date().toLocaleString()}`);
    console.log("");

    const runner = new Runner(registry);

    await runner.run();
})();
