const fs=require("fs");
const bodyParser=require("body-parser");
const express=require("express");
const Options={
    port:8888
};
const html=fs.readFileSync("index.html");
const server=express();
server.use(bodyParser.urlencoded({extended:false}));
server.post("/post",(request,response)=>{
    if(!request.body||!request.body.token||!/[0-9a-zA-Z]{32}$/.test(request.body.token)){
        response.statusCode=403;
        response.end("403 Forbidden");
        return
    }
    process.stdout.write(request.body.token);
    response.statusCode=200;
    response.end("200 Succeeded");
});
server.all(/\/|\/index.html|\/index/,(request,response)=>{
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(html);
});
server.listen(Options.port);