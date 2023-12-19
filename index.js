import fastify from "fastify";
import { Server } from 'socket.io';
import cors from '@fastify/cors'
import fastifyMultipart from 'fastify-multipart';
import connectDB from './DatabaseConnection/Database.js';
import UserRoutes from "./Routes/UserRoutes.js"
import PostRoutes  from "./Routes/PostRoutes.js"

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;;
const REACT_PORT = process.env.REACT_PORT || 'http://localhost:3000'; // Update with your React app's origin
const host = ("RENDER" in process.env) ? `0.0.0.0` : `localhost`;

const app = fastify(); 
await app.register(cors, { 
  // put your options here
})
// app.use(cors())
// Use fastify-cors middleware for HTTP routes
// app.register(fastifyCors, {
//   origin: REACT_PORT,
//   credentials: true,
// });

app.register(fastifyMultipart)
// Routes
app.register(UserRoutes)
app.register(PostRoutes)
app.get('/', async (req, res) => {
  return { message: 'Welcome to FirstConnect server' };
});

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.log(err);
  }
};

start();
const socketport = app.listen({host: host, port: PORT },(err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
// const socketport = app.listen(PORT, () => {
//     console.log("App start " + PORT);
//   });
  
  const io = new Server(socketport, {
    cors: {
      origin: process.env.REACT_PORT,
      credentials: true,
    },
  });
  
  global.onlineUsers = new Map();
  let activeUsers = [];
  
  io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
      if (!activeUsers.some((user) => user.userId === userId)) {
        activeUsers.push({ userId: userId, socketId: socket.id });
      }
      io.emit("get-users", activeUsers);
    });
  
    socket.on("disconnect", () => {
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      io.emit("get-users", activeUsers);
    });
  
    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data.messagetext, data.messageid);
      }
    });
});
