var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var path = request.url 
  var query = ''
  if(path.indexOf('?') >= 0){ query = path.substring(path.indexOf('?')) }
  var pathNoQuery = parsedUrl.pathname
  var queryObject = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('HTTP 路径为\n' + path)
  if(path == '/style.css'){
    response.setHeader('Content-Type', 'text/css; charset=utf-8')
    response.write('body{background-color: #ddd;}h1{color: red;}')
    response.end()
  }else if(path == '/main.js'){
    response.setHeader('Content-Type', 'text/javascript; charset=utf-8')
    response.write('alert("这是JS执行的")')
    response.end()
  }else if(path == '/'){
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
      let string = fs.readFileSync('./index.html','utf-8')
      let cookies = request.headers.cookie.split('; ')
      let hash ={}
      for(let i=0;i<cookies.length;i++){
        let parts = cookies[i].split('=')
        let key = parts[0];
        let value =parts[1]
        hash[key] = value
      }
      let email = hash.sign_in_email
      let users = fs.readFileSync('./db/user.json','utf-8')
      users = JSON.parse(users)
      let foundUser
      for(let i=0;i<users.length;i++){
        if(users[i].email === email){
          foundUser = users[i]
          break
        }
      }
      if(foundUser){
        string = string.replace('__password__',foundUser.password)
      }else{
        string = string.replace('__password__','不知道')
      }
      response.write(string)
      console.log('hash')
      console.log(hash)
    response.end()
  }else if(path === '/sign_up' && method === "GET"){
    let string = fs.readFileSync('./sign_up.html')
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/sign_up' && method === "POST"){
    readBody(request).then((body) => {
      let strings = body.split('&');
      let hash = {};
      let inUse = false;
      strings.forEach((string)=>{
        let parts = string.split('=')
        let key = parts[0]
        let value = parts[1]
        hash[key] =decodeURIComponent(value)
      })
      let {email,password,password_confirm} = hash;
      if(email.indexOf('@') === -1){
        response.statusCode = 400;
        console.log(email)
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.write(`{
          "errors":{
            "email":"invalid"
          }
        }`)
        response.end()
      }else if( password !== password_confirm){
        response.statusCode = 400;
        response.write('password not match')
        response.end()
      }else{
        var users = fs.readFileSync('./db/user.json','utf-8')
        try{
        users = JSON.parse(users)
        }catch(exception){
          users = [];
          console.log(users)
        }
        for(let i=0;i<users.length;i++){
          let user = users[i]
          if(user.email === email){
            inUse = true
            break
          }
        }
        if(inUse){
          response.statusCode = 400;
          response.write(`{
            "errors":{
              "email":"email in use"
            }
          }`)
          response.end()
        }else{        
          users.push({email:email,password:password})
        var usersJson = JSON.stringify(users)
        fs.writeFileSync('./db/user.json',usersJson)
        response.statusCode = 200;
        response.end()}
      }
      console.log({email,password,password_confirm});
      response.statusCode = 200;
      response.end()
    })
  } else if(path === "/sign_in" && method === "GET"){
    let string = fs.readFileSync('./sign_in.html','utf-8')
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === "/sign_in" && method === "POST"){
    let string = fs.readFileSync('./db/user.json')
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    readBody(request).then((body) => {
      let strings = body.split('&');
      let hash = {};
      strings.forEach((string)=>{
        let parts = string.split('=')
        let key = parts[0]
        let value = parts[1]
        hash[key] =decodeURIComponent(value)
      })
      let {email,password} = hash;
      console.log(email)
      console.log(password)
      if(email.indexOf('@') === -1){
        response.statusCode = 400;
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.write(`{
          "errors":{
            "email":"invalid"
          }
        }`)
        response.end()
      }else{
        var users = fs.readFileSync('./db/user.json','utf-8')
        try{
        users = JSON.parse(users)
        }catch(exception){
          users = [];
        }
        let found = false;
        for(let i=0;i<users.length;i++){
          let user = users[i]
          if(user.email === email && user.password === password){
            found = true
            break
          }
        }
        if(found){
          response.statusCode = 200;
          response.setHeader("Set-Cookie",`sign_in_email=${email}`)
          response.write(`ok`)
          response.end()
        }else{        
        response.statusCode = 401;
        response.write(`error`)
        response.end()}
      }
      console.log({email,password});
      response.statusCode = 200;
      response.end()
    })
  }else{
    response.statusCode = 404
    response.end()
  }

  /******** 代码结束，下面不要看 ************/
})
function readBody(request){
  return new Promise((resolve,reject) => {
    let body = [];
    request.on('data',(chunk) => {
      body.push(chunk)
    }).on('end',() => {
    body = Buffer.concat(body).toString();
    resolve(body)
    })
  })
}

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)
