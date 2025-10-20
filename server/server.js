import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDb from './configs/db.js';
import userRouter from './routes/authRoutes.js';
import busRouter from './routes/busRoutes.js';

dotenv.config();
await connectDb();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// ⚡ Socket.io
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT"] }
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log('🟢 Client connected:', socket.id);
  socket.on("disconnect", () => console.log('🔴 Client disconnected:', socket.id));
});

// Routes
app.use('/api/auth', userRouter);
app.use('/api/buses', busRouter);

// Default route
app.get('/', (req, res) => res.send('Saferide Server is running'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
