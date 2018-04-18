var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
   res.sendfile('index.html');
});

//Indításnál nevet kell választani, már létezőt nem lehet
io.on('connection', function(socket) {
   console.log('A user connected');
   socket.on('setUserName', function() {
       if(0){
           socket.emit('userAlreadyExist');
       }
       else{
           socket.emit('setUserName');
       }
   });

   //Lekérjük az online userek listáját és kilistázzuk a kliensen
   socket.on('getUsers', function() {
       socket.emit('listUsers');
   });

   //Chatszobát akar valaki létrehozni a meghívottaknak küldünk üzenetet hogy csatlakozzanak
   socket.on('startChat', function(room) {
       socket.join(room);
       for(;;){
           //socket.broadcast.to(socketid).emit('message', 'for your eyes only');
           if (io.sockets.connected[socketid]) {
               io.sockets.connected[socketid].emit('invite');   
           }
       }
   });


   //Ha valaki csatlakozik akkor rögtön elüldi az információkat a p2p kapcsolathoz
   socket.on('joinChat', function(room) {
       socket.join(room);
       socket.broadcast.to(room).emit('sendInfo');
   });

   //szoba elhagyása visszatérés az online user listához
   socket.on('leaveChat', function(room) {
       socket.leave(room);
       socket.emit('listUsers');
    });


   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });
});

http.listen(3000, function() {
   console.log('listening on localhost:3000');
});