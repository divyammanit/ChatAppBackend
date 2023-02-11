const http=require('http');
const express=require('express');
// const socketio=require('socket.io');
  
const cors=require('cors');
const {addUser,removeUser,getUser,getUserInRoom} = require('./users');

const PORT = process.env.PORT || 5000;
const router=require('./router');

const app=express();
const server=http.createServer(app);
const BACKEND_URL=process.env.BACKEND_URL || '';

const io = require("socket.io")(server, {
    cors: {
      origin: BACKEND_URL,
      methods: ["GET", "POST"]
    }
});
// app.use(cors());

// app.use(cors());

io.on('connection',(socket)=>{
    console.log('we have a new connection!!!');

    socket.on('join',({name,room},callback)=>{
        console.log(name,room);

        const {error,user} = addUser({id: socket.id,name,room});

        if(error) return callback(error);

        socket.emit('message',{user: 'admin', text:`${user.name}, Welcome to the room ${user.room}`});
        socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name}, has joined!!`});


        socket.join(user.room);

        io.to(user.room).emit('roomData',{room:user.room,users:getUserInRoom(user.room)})
        callback();
    })

    socket.on('sendMessage', (message,callback) => {
        const user=getUser(socket.id);

        io.to(user.room).emit('message',{user: user.name , text:message});
        
        callback();
    });

    socket.on('disconnect',()=>{
        // console.log('User had left!!!');
        const user=removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} has left`});
            io.to(user.room).emit('roomData',{room:user.room , users:getUserInRoom(user.room)});
        }
    })
})

app.use(router);
app.use

server.listen(PORT,()=>{
    console.log(`server has started at port ${PORT}`);
})
