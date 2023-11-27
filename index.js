var express = require('express');
var app = express();
const PORT = 4000;

var http = require('http').createServer(app);
const cors = require('cors');


var socketIO = require('socket.io') (http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

app.use(cors({
  origin: '*', // Replace with the correct port
  credentials: true, // You may need this option if you're sending cookies or sessions
}));

let users = [];

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected`);

    socket.on('message', (data) => {
        // console.log(data);
        socketIO.emit('messageResponse', data);
    });

    socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));

    socket.on('resetTypingStatus', (data) => socket.broadcast.emit('typingResponse', data));

    socket.on('newUser', (data) => {
        users.push(data);
        socketIO.emit('newUserResponse', users);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        users = users.filter((user) => user.socketID !== socket.id);

        socketIO.emit('newUserResponse', users);
        socket.disconnect();
    });
});

app.get('/api', (req, res) => {
    res.json({
        message: 'Hello World'
    });
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
