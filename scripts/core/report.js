const health = require("./health");

module.exports = function generateReport(data){

  const report = {};

  for(const item of data){

    report[item.name] = item.data;

  }

  if(report.project){

    const size = report.project.size || "0";

    report.project.sizeMB =
      parseFloat(size.replace("M","").replace("G","000")) || 0;

  }

  if(report.git){

    report.git.workingTreeDirty =
      Boolean(report.git.status);

  }

  if(report.files){

    const first = report.files.largest
      ? report.files.largest.split("\n")[0]
      : "";

    report.files.largestFileMB =
      parseInt(first.split(" ")[0] || 0) / 1000000;

  }

  return {
    ...report,
    health: health(report)
  };

};
