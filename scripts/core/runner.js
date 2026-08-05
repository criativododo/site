const fs = require("fs");
const path = require("path");
const registry = require("./registry");
const generateReport = require("./report");
const markdown = require("./markdown");
const exportReport = require("./export");

class Runner {

  async run(){

    const collectors = registry.all();
    const results = [];

    console.log("Executando auditoria...");
    console.log("");

    for(const collector of collectors){

      try{

        const data = await collector.collect();

        results.push({
          name: collector.name,
          data
        });

        console.log("✓", collector.name);

      }catch(e){

        results.push({
          name: collector.name,
          data:{
            error:e.message
          }
        });

        console.log("⚠", collector.name);

      }

    }

    const report = generateReport(results);

    const output = markdown(report);

    const dir = path.join(
      process.cwd(),
      "reports",
      "saude"
    );

    fs.mkdirSync(dir,{recursive:true});

    fs.writeFileSync(
      path.join(dir,"DODÔ PROJECT HEALTH REPORT.md"),
      output,
      "utf8"
    );

    const download = exportReport(output);

    console.log("");
    console.log("══════════════════════════════════════");
    console.log("DODÔ HEALTH SCORE");
    console.log("══════════════════════════════════════");
    console.log("");
    console.log(report.health.score+"/100");

    if(report.health.warnings.length){

      console.log("");
      console.log("Alertas:");

      report.health.warnings.forEach(w=>{
        console.log("⚠",w);
      });

    }

    console.log("");
    console.log("Relatório criado:");
    console.log("reports/saude/DODÔ PROJECT HEALTH REPORT.md");
    console.log("Downloads:", download);

  }

}

module.exports = Runner;
