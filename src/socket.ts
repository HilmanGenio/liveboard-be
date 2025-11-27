import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from './utils/config';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: number };
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`🔌 User connected: ${socket.id} (User ID: ${userId})`);

    // Join user to main room
    socket.join('liveboard');

    // Handle custom events
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`User ${userId} joined room: ${room}`);
    });

    socket.on('leave_room', (room: string) => {
      socket.leave(room);
      console.log(`User ${userId} left room: ${room}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected: ${socket.id} (User ID: ${userId}) - Reason: ${reason}`);
    });

    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket first.');
  }
  return io;
};

// Helper functions for broadcasting
export const broadcastNewPost = (post: any) => {
  if (io) {
    io.to('liveboard').emit('new_post', post);
  }
};

export const broadcastLikeUpdate = (likeData: any) => {
  if (io) {
    io.to('liveboard').emit('like_update', likeData);
  }
};
