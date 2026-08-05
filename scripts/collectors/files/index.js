const {execSync}=require("child_process");

module.exports={

  name:"files",

  async collect(){

    const cmd=`
find . \
-type f \
-not -path "*/node_modules/*" \
-not -path "*/.git/*" \
-not -path "*/dist/*" \
-print0 |
xargs -0 stat -f "%z %N" |
sort -nr |
head -20
`;

    return{
      largest:execSync(cmd,{encoding:"utf8"}).trim()
    };

  }

};
