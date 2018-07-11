var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(2341);    //use port 2341

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

var messages = 
	{
		name:"Ming", message:"Heloooooooooo"
	}
;
var timer = null ;
var typing = "false";
// socket 是對個體連線 ， io是對全體
io.on('connection', function (socket) {
  console.log('a user connected');
  socket.emit('allMessage', messages);
  socket.on("message", function (msg) {
  	messages = msg;
    console.log(msg.userName +"說了"+ msg.userMsg);
    io.emit("newMessage",msg);
 });

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