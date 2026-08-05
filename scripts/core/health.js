module.exports = function health(report){

  let score = 100;
  const warnings = [];

  if(report.project?.sizeMB > 500){
    score -= 10;
    warnings.push("Projeto acima de 500 MB");
  }

  if(report.git?.workingTreeDirty){
    score -= 5;
    warnings.push("Working Tree possui alterações");
  }

  if((report.cache?.totalMB || 0) > 100){
    score -= 5;
    warnings.push("Cache elevado");
  }

  if((report.files?.largestFileMB || 0) > 20){
    score -= 10;
    warnings.push("Arquivo muito grande encontrado");
  }

  return {
    score: Math.max(score,0),
    warnings
  };

};
