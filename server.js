import express from 'express'

import { Server } from 'socket.io'
import cors from 'cors'
import http from 'http'
import { connect } from './config.js';
import { chatModel } from './chat.schema.js';

// 1 Create server 
const app = express();
const server = http.createServer(app);

// 2 Create socket server 

const io = new Server(server,{
    cors:{
        origin:'*',
        methods:["GET","POST"]
    }
})

// 3 Use socket events 

io.on('connection',(socket)=>{  
    console.log("Connection is established")

    socket.on("join",(data)=>{
        socket.userName=data;

        // send old message to the client 
        chatModel.find().sort({timestamp:1}).limit(50)
        .then(message=>{
            socket.emit('load_message',message)
        }).catch(err=>{
            console.log(err)
        })
    })
    socket.on('new-message',(message)=>{
        // broadcast this message to all the clients  

        let userMessage ={
            userName:socket.userName,
            message:message
        }

        const newChat = new chatModel({
            userName:socket.userName,
            message:message,
            timestamp:new Date()
        });
        newChat.save()
        socket.broadcast.emit('broadcast_message',userMessage)
    })

    socket.on("disconnect",()=>{
        console.log("connection is disconnected")
    })
})

server.listen(3000,()=>{
    console.log("App is listening on 3000 ")
    connect()
})
