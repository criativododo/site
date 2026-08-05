const {execSync}=require("child_process");

function run(cmd){
    try{
        return execSync(cmd,{encoding:"utf8"}).trim();
    }catch{
        return null;
    }
}

module.exports={

    name:"project",

    async collect(){

        return{

            size:run("du -sh . | cut -f1"),

            files:run("find . -type f | wc -l"),

            directories:run("find . -type d | wc -l"),

            biggest:run("du -hd 2 . 2>/dev/null | sort -hr | head -10")

        };

    }

};
