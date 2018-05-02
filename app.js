var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3000, function() {
    console.log('listening on localhost:3000');
 });

app.get('/', function(req, res) {
   res.sendfile(__dirname + '/index.html');
});

var users = [];
var connections = [];

//Indításnál nevet kell választani, már létezőt nem lehet
io.sockets.on('connection', function(socket) {
    connections.push(socket);
   console.log('User connected: %s sockets connected',connections.length);
   
   socket.on('disconnect', function(data){
       users.splice(users.indexOf(socket.username), 1);
       updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('User disconnected: %s sockets connected',connections.length);
   });
   
   socket.on('send message', function(data){
       console.log(data);
    io.sockets.emit('new message', {msg: data, user: socket.username});
   });

   socket.on('new user', function(data, callback){
       callback(true);
       socket.username = data;
       users.push(socket.username);
       updateUsernames();
    });

    function  updateUsernames(){
        io.sockets.emit('get users', users);
    }
/*   socket.on('setUserName', function(data) {
       if(userExist(data)!=undefined){
           socket.emit('userAlreadyExist');
           console.log('User already exist (on server side)');
       }
       else{
           socket.emit('setUserName');
           console.log('Username is set (on server side)');
       }
   });

   //Lekérjük az online userek listáját és kilistázzuk a kliensen
   socket.on('getUsers', function() {
       socket.emit('listUsers', users);
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
   });*/
});

