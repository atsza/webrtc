var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3000, function () {
    console.log('listening on localhost:3000');
});

app.use('/client', express.static(__dirname + '/client'));
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/client/index.html');
});

class User {
    constructor(username, socket) { }
}

var users = [];
var connections = [];

//Indításnál nevet kell választani, már létezőt nem lehet
io.sockets.on('connection', (socket) => {
    connections.push(socket);
    console.log('User connected: %s sockets connected', connections.length);

    socket.on('disconnect', (data) => {
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('User disconnected: %s sockets connected', connections.length);
    });

    socket.on('send message', (data) => {
        io.sockets.emit('new message', { msg: data, user: socket.username });
    });


    socket.on('new user', (data) => {
        socket.username = data;
        if (users.filter((user) => { return user.username == socket.username }).length == 0) {
            users.push({
                'username': socket.username,
                'socket': socket.id
            }
            );
            updateUsernames();
            io.sockets.emit('user added', { user: socket.username });
        } else {
            io.sockets.emit('invalid username', { user: socket.username });
        }
    });

    socket.on('user disconnect', (data) => {
        socket.username = '';
        let index = users.indexOf(data)
        users.splice(index, 1);
        updateUsernames();
    });

    function updateUsernames() {
        io.sockets.emit('get users', users);
    }


    socket.on('message', (data) => {
        console.log(data.toUser);
        console.log(data.description);
        let toUser = getUserByName(data.toUser);
        socket.to(toUser.socket).emit('message', data);
    });

    function getUserByName(userName) {
        for (let user of users) {
            if (user.username === userName) {
                return user;
            }
        }
        return null;
    }
});

