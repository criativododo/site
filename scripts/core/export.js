const fs = require("fs");
const os = require("os");
const path = require("path");

module.exports = function exportReport(content){

    const downloads = path.join(
        os.homedir(),
        "Downloads"
    );

    const date = new Date()
        .toISOString()
        .replace(/:/g,"-")
        .replace(/\..+/,"");

    const filename =
        `DODÔ PROJECT HEALTH REPORT - ${date}.md`;

    const target = path.join(
        downloads,
        filename
    );

    fs.writeFileSync(
        target,
        content,
        "utf8"
    );

    return target;

};
