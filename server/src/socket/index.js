import { Server } from 'socket.io';
import { env } from '../config/env.js';

export function initializeSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.emit('socket_connected', { connectedAt: new Date().toISOString() });
  });

  return io;
}
