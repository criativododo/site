const prompt = require("./prompt");

module.exports = function markdown(report){

return `# DODÔ PROJECT HEALTH REPORT

Data: ${new Date().toLocaleString()}

---

# Health Score

${report.health.score}/100

${
report.health.warnings.length
? report.health.warnings.map(x=>"- ⚠ "+x).join("\n")
: "- Nenhum alerta"
}

---

# Sistema

\`\`\`json
${JSON.stringify(report.system,null,2)}
\`\`\`

---

# Git

\`\`\`json
${JSON.stringify(report.git,null,2)}
\`\`\`

---

# Projeto

\`\`\`json
${JSON.stringify(report.project,null,2)}
\`\`\`

---

# Dependências

\`\`\`json
${JSON.stringify(report.dependencies,null,2)}
\`\`\`

---

# Build

\`\`\`json
${JSON.stringify(report.build,null,2)}
\`\`\`

---

# Cache

\`\`\`json
${JSON.stringify(report.cache,null,2)}
\`\`\`

---

# Arquivos Grandes

\`\`\`
${report.files?.largest || ""}
\`\`\`

---

# Prompt para IA

\`\`\`text
${prompt()}
\`\`\`

`;

};
