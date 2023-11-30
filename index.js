const express = require('express');
const app = express();
const PORT = 4000;

const http = require('http').Server(app);
const cors = require('cors');

const socketIO = require('socket.io') (http, {
    cors: { origin: "*",}
});

// app.use(cors());

app.use(cors({
    origin: '*', // Replace with the correct port
    credentials: true, // You may need this option if you're sending cookies or sessions
  }));
let users = [];
let rooms = {};

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected`);

    socket.on('message', (data) => {
        // console.log(data);
        const room = data.room;
        const message = { name: data.name, text: data.text, timestamp: data.timestamp };

        if (!rooms[room]) {
            rooms[room] = [];
        }

        rooms[room].push(message);

        socketIO.to(room).emit('messageResponse', message);
        // socketIO.emit('messageResponse', data);
    });

    // socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));
    socket.on('typing', (data) => socket.broadcast.to(data.room).emit('typingResponse', data));

    socket.on('resetTypingStatus', (data) => socket.broadcast.to(data.room).emit('typingResponse', data));

    // socket.on('resetTypingStatus', (data) => socket.broadcast.emit('typingResponse', data));

    // socket.on('newUser', (data) => {
    //     users.push(data);
    //     socketIO.emit('newUserResponse', users);
    // });
    socket.on('newUser', (data) => {
        users[socket.id] = { userName: data.userName, socketID: socket.id };
        socketIO.emit('newUserResponse', Object.values(users));
    });

    socket.on('joinRoom', (data, messages) => {
        const room = data.room;
        socket.join(room);
        // console.log(messages);
        // const message = { name: messages.id, text: messages.text, timestamp: messages.timestamp };

        // if (rooms[room]) {
        //     socketIO.to(room).emit('pastMessages', data);
        // }

        socketIO.to(room).emit('newUserResponse', Object.values(users));
    });

    socket.on('leaveChat', (data) => {
        const userName = data.userName;
        delete users[socket.id];
        socketIO.emit('newUserResponse', Object.values(users));
        console.log(`${userName} left the chat`);
      });
      
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        // delete users[socket.id];
        // users = users.filter((user) => user.socketID !== socket.id);

        socketIO.emit('newUserResponse', Object.values(users));
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
