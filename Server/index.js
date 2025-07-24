import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import bodyParser from "body-parser"
import videoroutes from './Routes/video.js'
import userroutes from "./Routes/User.js"
import path from 'path'
import commentroutes from './Routes/comment.js'

// --- Socket.io for WebRTC signaling ---
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';


dotenv.config()
const app=express()

// Use CORS with frontend URL for production
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}))
app.use(express.json({limit:"30mb",extended:true}))
app.use(express.urlencoded({limit:"30mb",extended:true}))
app.use('/uploads',express.static(path.join('uploads')))

app.get('/',(req,res)=>{
    res.send("Your tube is working")
})

app.use(bodyParser.json())
app.use('/user',userroutes)
app.use('/video',videoroutes)
app.use('/comment',commentroutes)
const PORT= process.env.PORT || 5000

// --- Create HTTP server and attach Socket.io ---
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST']
    }
});

// --- WebRTC signaling logic ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room (for 1:1 or group calls)
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', socket.id);
    });

    // Relay signaling data (offer/answer/candidate)
    socket.on('signal', ({ roomId, data }) => {
        socket.to(roomId).emit('signal', { sender: socket.id, data });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Notify others in all rooms
        socket.rooms.forEach(roomId => {
            socket.to(roomId).emit('user-left', socket.id);
        });
    });
});

// --- Start both Express and Socket.io ---
httpServer.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});

// Use MongoDB Atlas for production
const DB_URL=process.env.DB_URL || "mongodb://localhost:27017/youtube_clone"
mongoose.connect(DB_URL).then(()=>{
    console.log("Mongodb Database connected")
}).catch((error)=>{
    console.log("MongoDB connection error:", error.message)
    console.log("Please make sure MongoDB is running or set DB_URL in .env file")
})