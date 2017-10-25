 var fs = require('fs')

 var dirName = process.argv[2] // 你传的参数是从第 2 个开始的

 process.chdir("C:/Users/Administrator/Desktop") // cd ~/Desktop
 fs.mkdirSync("./" + dirName) // mkdir $1
 process.chdir("./" + dirName) // cd $1
 fs.mkdirSync('css') // mkdir css
 fs.mkdirSync('js') // mkdir js

 var date = "<!DOCTYPE><title>Hello</title><h1>Hi</h1>"
 fs.writeFileSync("./index.html",date,"utf-8")
 var date2 = "h1{color: red;}"
 fs.writeFileSync("css/style.css", date2,"utf-8")
 var date3 = "var string = 'Hello World';alert(string)"
 fs.writeFileSync("./js/main.js",date3,"utf-8")

 process.exit(0)