const {execSync}=require("child_process");

function run(cmd){
    try{return execSync(cmd,{encoding:"utf8"}).trim();}
    catch{return "Nenhum";}
}

module.exports={

    name:"cache",

    async collect(){

        return{

            cache:run("find . -type d \\( -name .cache -o -name .vite -o -name .turbo -o -name coverage \\) -exec du -sh {} + 2>/dev/null")

        };

    }

};
