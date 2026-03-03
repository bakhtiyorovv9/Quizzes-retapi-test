const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { isBoxedPrimitive } = require('node:util/types');
const { json } = require('node:stream/consumers');
const { url } = require('node:inspector');



const PORT = 3030;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  })

  req.on("end", () => {
    if ( req.headers["content-type"] === "application/json"){
      req.body = JSON.parse(body || {});
    }
    handleRequest(req,res)
  })
});

function handleRequest(req,res){
  const method = req.method;
  const urls = req.url?.split("/");
  const filePath = path.join( process.cwd(), "data", "quizzes.json");

  // console.log(urls)


  // default headers 
  res.statusCode = 200;
  res.setHeader("Content-Type", "application /json");

  const data = JSON.parse(fs.readFileSync(filePath,{encoding: "utf-8"}));

  if (method === "GET"){
    if(urls[1] === "quizzes"){
      if (!urls[2]) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
        return;
      }
      if(urls[2]){
        if ( Number(urls[2])){
          const id = urls[2]
          const quiz = data.find((el) => el.id == id);

          if(!quiz){
            res.statusCode = 404;
            res.end(JSON.stringify({
              success: false,
              message: `ID ${id} quiz not found`
            })
            );
            return;
          }
          res.writeHead(200,{"Content-Type":"applicationb/json"})
          res.end(JSON.stringify(quiz))
          return;
        }else{
          res.writeHead(400,{"Content-Type": "application/json"})
          res.end(JSON.stringify({
            success:false,
            message:"ID must be a number"
          }))
          return;
        }
      }
    }
    return;
  }

  // if(method === "POST"){
  //   if(urls[1] === "quizzes"){

  //   }
  // }
  if( method === "DELETE"){
    if( urls[1] === "quizzes"){
      if( urls[2] ){
        if (!Number(urls[2])){
          res.writeHead(400,{"Content-Type": "application/json"});
          res.end(JSON.stringify({
            success:false,
            message:"ID must be a number"
          }))
          return;
        }
        const id = urls[2];

        const foundedquiz = data.find((el) => el.id == id);

        if(!foundedquiz){
          res.statusCode = 404;
          res.end(
            JSON.stringify({
              success:false,
              message: `ID ${id} not found`
            })
          );
          return;
        }
        
        const filteredData = data.filter((el) => el.id != id);

        fs.writeFileSync(filePath,JSON.stringify(filteredData,null,4));

        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          message: `quiz ID ${id} has been deleted.`
        }))
        return;
      };
      res.statusCode = 404;
      res.end(JSON.stringify({
        success: false,
        message: `Resource not found`
      }))
      return
    }
  }

  if( method === "POST"){
    if( urls[1] === "tasks" ){
      const quiz = req.body;

      const lastQuiz = data.sort((a,b) => a.id - b.id).at(-1);

      const newQuiz = {
        ...quiz,
        id: (lastQuiz?.id || 0) + 1,
      };


    }
  }

  res.statusCode = 404;
  res.end(
    JSON.stringify({
      message: `Berilgan URL: ${req.url} topilmadi`,
    }),
  );
}

function ValidationQuiz(body){
  
}


server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
