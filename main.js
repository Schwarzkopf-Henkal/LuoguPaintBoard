const fs=require("fs");
const fetch=require("node-fetch");
const child_process=require("child_process");
const qs=require("qs");
const Options={
    URL:"https://www.luogu.com.cn/paintboard",
    Delay1:30000,
    Delay2:10000,
    Length:1000,
    Height:600,
    Colors:32,
    Mode:0,//0顺序执行,1随机执行
    Log:true,
    Http:true,
    Battle:true
};
var token=new Set();
var plan=JSON.parse(fs.readFileSync("plan.json"));
var cur_board,que=[];
async function token_add(new_token){
    if(token.has(new_token))
        return 0;
    token.add(new_token);
    fs.writeFileSync("token.json",JSON.stringify(Array.from(token)));
    if(Options.Log)
        fs.appendFileSync("paintboard.log",`${(new Date()).toLocaleString()} 加入token=${new_token}\n`);
    run_token(new_token);
}
async function token_delete(bad_token){
    if(!token.has(bad_token))
        return 0;
    token.delete(bad_token);
    fs.writeFileSync("token.json",JSON.stringify(Array.from(token)));
    if(Options.Log)
        fs.appendFileSync("paintboard.log",`${(new Date()).toLocaleString()} 删除token=${bad_token}\n`);
}
async function run_board(){
    while(1){
        let raw_board=await (await fetch(Options.URL+"/board")).text();
        cur_board=raw_board.split("\n").map((val)=>Array.from(val).map((val)=>parseInt(val,Options.Colors)));
        que=[];
        for(i of plan)
            if(cur_board[i[0]][i[1]]!=i[2])
                que.push(i)
        if(Options.Log)
            fs.appendFileSync("paintboard.log",`${(new Date()).toLocaleString()} 剩余任务数=${que.length}\n`);
        await sleep(Options.Delay2);
    }
}
async function run_token(cur_token){
    while(1){
        if(que.length===0){
            await sleep(Options.Delay2);
            continue;
        }
        let cur_task,res;
        if(Options.Mode===0){
            cur_task=que[0];
            que.shift();
        }
        if(Options.Mode===1){
            let tar=Math.floor(Math.random()*que.length);
            cur_task=que[tar];
            que.splice(tar,1);
        }
        try{
            res=await fetch(Options.URL+"/paint",{
                "headers":{
                    "Referer":Options.URL,
                    "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                "body":qs.stringify({
                    "x":cur_task[0],
                    "y":cur_task[1],
                    "color":cur_task[2],
                    "token":cur_token
                }),
                "method":"POST",
            });
        }catch(err){
            console.log(err);
        }
        if(res.ok){
            let response=await res.json();
            if(response.status===401){
                token_delete(cur_token);
                return;
            }else if(response.status===200){
                if(Options.Log)
                    fs.appendFileSync("paintboard.log",`${(new Date()).toLocaleString()} [${cur_token.substring(0,8)}]成功发送{x:${cur_task[0]},y:${cur_task[1]},color:${cur_task[2]}}\n`);
                await sleep(Options.Delay1);
            }else if(response.status===410){
                if(Options.Battle){
                    if(Options.Log)
                        fs.appendFileSync("paintboard.log",`${(new Date()).toLocaleString()} [${cur_token.substring(0,8)}]被占用，正在争夺使用权\n`);
                    switch(await new Promise((resolve,reject)=>{
                        child_process.exec(`node battle.js ${JSON.stringify([cur_token,cur_task[0],cur_task[1],cur_task[2]])}`).on("exit",(code)=>{
                            resolve(code);
                        });
                    })){
                        case 0:
                            if(Options.Log)
                                fs.appendFileSync("paintboard.log",`${(new Date()).toLocaleString()} [${cur_token.substring(0,8)}]成功夺取使用权\n`);
                            await sleep(Options.Delay1);
                            break;
                        case 1:
                            if(Options.Log)
                                fs.appendFileSync("paintboard.log",`${(new Date()).toLocaleString()} [${cur_token.substring(0,8)}]争夺过程中token失效\n`);
                            token_delete(cur_token);
                            return;
                        case 2:
                            if(Options.Log)
                                fs.appendFileSync("paintboard.log",`${(new Date()).toLocaleString()} [${cur_token.substring(0,8)}]争夺超时\n`);
                            await sleep(Options.Delay1);
                            break;
                    }
                }else{
                    if(Options.Log)
                        fs.appendFileSync("paintboard.log",`${(new Date()).toLocaleString()} [${cur_token.substring(0,8)}]被占用\n`);
                    await sleep(Options.Delay1);
                }
            }
        }
    }
}
function sleep(time){
    return new Promise((resolve) => setTimeout(resolve, time));
}
//-----//
fs.writeFileSync("pid",process.pid);
process.on("exit",(code)=>{
    fs.unlinkSync("pid");
    if(Options.Log)
        fs.appendFileSync("paintboard.log",`${(new Date()).toLocaleString()} 程序结束\n`);
});
process.stdin.on("data",(data)=>{
    data=data.toString();
    if(data=="Refresh"){
        plan=JSON.parse(fs.readFileSync("plan.json"));
        if(Options.Log)
            fs.appendFileSync("paintboard.log",`${(new Date()).toLocaleString()} 图片缓存刷新\n`);
    }
});
if(Options.Http){
    child_process.exec("node httpserver.js").stdout.on("data",(data)=>{
        data=data.toString();
        token_add(data);
    });
    if(Options.Log)
        fs.appendFileSync("paintboard.log",`${(new Date()).toLocaleString()} Http服务器运行\n`);
}
if(Options.Log)
    fs.appendFileSync("paintboard.log",`${(new Date()).toLocaleString()} 程序运行\n`);
run_board();
for(let key of JSON.parse(fs.readFileSync("token.json")))
    token_add(key);