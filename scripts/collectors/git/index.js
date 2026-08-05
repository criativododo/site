const {execSync} = require("child_process");

function run(cmd){

    try{
        return execSync(cmd,{encoding:"utf8"}).trim();
    }catch{
        return null;
    }

}

module.exports={

    name:"git",

    async collect(){

        return{

            branch:run("git branch --show-current"),

            status:run("git status --short"),

            lastCommit:run("git log -1 --pretty=format:'%h %ad %s' --date=short"),

            gitSize:run("du -sh .git | cut -f1"),

            objectCount:run("git count-objects -vH")

        };

    }

};
