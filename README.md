# socket.io

hackmd : https://hackmd.io/u5rAUgCtQtGutHXv2bc8vw?both

# Socket , NodeJs 聊天室 

## 首先是npm，到官網下載。[點我下載](https://www.npmjs.com)
## 接著打開cmd輸入，就會直接下載socket 及 Express
```
npm i socket.io express -s // download
node index.js //cmd path下執行
```
## 把pm2也一起載進來，之後可以不用開著nodejs就可以運行
```
npm install pm2 -g // download
pm2 start index.js //執行語法
pm2 kill // 關掉pm2語法
```

# Server端先引入一些檔案 (index.js)
```javascript=
var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
```

## 選擇要監聽的Port
#### 這裡是使用 2341Port
```javascript=
app.listen(2341); 
```

```javascript=
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}
```

## 以下做幾件事情
### 1.判斷connection
### 2.判斷誰說了什麼
### 3.判斷目前線上人數
### 4.判斷有人是否正在輸入以及秒數設定
```javascript=
var numClients = -1;//計算人數，先扣掉伺服器
var timer = null ;
var typing = "false";
// socket 是對個體連線 ， io是對全體
1.
io.on('connection', function (socket) {
  console.log('a user connected');
2.  
  socket.on("message", function (msg) {
    messages = msg;
    console.log(msg.userName +"說了"+ msg.userMsg);
    io.emit("newMessage",msg);
  });
3.  
  // 有人連線 ++ 
  numClients++;
  //console.log('目前人數 : '+numClients);
  io.emit("numOnline",numClients); // 廣播出去
  socket.on("disconnect", function () { //有人離線
    numClients--;
    console.log('a user disconnect 目前人數 : '+numClients);
    io.emit("numOnline",numClients);
  });
4.
  socket.on("typing",function(){
    typing = "true";
    io.emit("typing",typing);
    clearTimeout(timer);
    timer = setTimeout(function(){
      typing=false;
      io.emit("typing",typing);
    },2000)
  })
});
```

# Client端 (index.html)
## 先引入檔案socket.js檔
### 這裡是直接把socket.js copy出來當絕對路徑使用了，應該是錯誤示範唄XDD
```javascript=
<script src="http://203.XX.XX.XX/kuma/socket.js"></script>
```
### OR 
### 只在本機端測試 : loaclhost+port
```javascript=
<script src="http://localhost:2341/socket.io/socket.io.js"></script>
```

## 連線
```javascript=
var socket = io('http://203.68.184.201:2341');
```
### OR本機端
```javascript=
var socket = io('http://localhost:2341');
```

## 以下做幾件事情
### 1.監聽newMessage事件，判斷是否有人說話，然後append到畫面上。
### 2.監聽numOnline事件，判斷在線人數，然後append到畫面上。
### 3.判斷input onkeypress，往伺服器送出"typing"
### 4.監聽typing事件，判斷是否有人正在輸入，然後append到畫面上。
### 5.按下送出後，將user及msg送到伺服器，之後將訊息欄清空。
```javascript=
1.
    socket.on("newMessage", (obj)=>{ // 監聽newMessage事件 是否有人說話
      var temp = "";
      var NowDate=new Date();
      var h=NowDate.getHours();
      var m=NowDate.getMinutes();
      var s=NowDate.getSeconds();
      temp = obj.userName +"："+ obj.userMsg+"    @"+h+':'+m+"<br>" ; 
      $('#temp').append(temp);
    });
2.    
    socket.on("numOnline", (numClients)=>{ // 監聽numOnline事件 判斷在線人數
      var onlineNum = "";
      onlineNum = numClients;
      $('#numClients').empty();
      $('#numClients').append("在線人數 : "+onlineNum);
    });
3.
    $('input').on('keypress', function() { //判斷keypress，往伺服器送出有人在輸入..
      socket.emit("typing");
    });
4.
    socket.on("typing", (value)=>{ //監聽typing事件，在畫面上顯示有人在打字...
      var type = false;
      type = value ;
      if(type){
        temp = "有人在輸入...";
      }else{
        temp="";
      }
      $('#type').empty();
      $('#type').append(temp);
    });
5.
    $('#button').on('click', function() {
      var userName = $('#name').val();
      var userMsg = $('#msg').val();
      var objMsg = {
        userName:userName, userMsg:userMsg 
      }
      socket.emit("message", objMsg);
      //var userName = $('#name').val("");
      var userMsg = $('#msg').val("");
    });
```

## io => 全體
## socket =>個體

## .on => 監聽事件
## .emit => 往另一方送事件
