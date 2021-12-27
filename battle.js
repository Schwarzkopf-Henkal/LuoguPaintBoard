const fetch=require("node-fetch");
const qs=require("qs");
const Options={
    URL:"https://www.luogu.com.cn/paintboard",
    Delay:1000
}
const task=JSON.parse(process.argv[2]);
(async()=>{
    while(1){
        try{
            res=await fetch(Options.URL+"/paint",{
                "headers":{
                    "Referer":Options.URL,
                    "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                "body":qs.stringify({
                    "x":task[1],
                    "y":task[2],
                    "color":task[3],
                    "token":task[0]
                }),
                "method":"POST",
            });
        }catch(err){
            console.log(err);
        }
        if(res.ok){
            let response=await res.json();
            if(response.status===401){
                process.exitCode=1;
                return;
            }else if(response.status===200){
                process.exitCode=0;
                return;
            }else if(response.status===410){
                await sleep(Options.Delay);
            }
        }
    }
})();
function sleep(time){
    return new Promise((resolve) => setTimeout(resolve, time));
}
setTimeout(()=>{process.exitCode=2},30000);