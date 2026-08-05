const os = require('os');

module.exports = {

  name: 'system',

  async collect() {

    return {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memoryGB: (os.totalmem()/1024/1024/1024).toFixed(2),
      freeMemoryGB: (os.freemem()/1024/1024/1024).toFixed(2),
      uptimeHours: (os.uptime()/3600).toFixed(2),
      node: process.version
    };

  }

};
