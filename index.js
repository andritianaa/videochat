const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    socket.on('join', room => {
        socket.join(room);
        socket.to(room).emit('other-user', socket.id);
        socket.on('offer', offer => {
            socket.to(room).emit('offer', offer);
        });
        socket.on('answer', answer => {
            socket.to(room).emit('answer', answer);
        });
        socket.on('disconnect', () => {
            socket.to(room).emit('user-disconnected', socket.id);
        });
    });
});

const PORT = 5000;

// Définir le répertoire contenant les fichiers statiques
const publicDirectoryPath = path.join(__dirname, 'public');
app.use(express.static(publicDirectoryPath));

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
