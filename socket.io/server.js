const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files
app.use(express.static('public'));

// ===== NAMESPACES =====
// Namespace: Used for separating logic on the server

// General chat namespace (default)
const generalNamespace = io.of('/general');
// Admin namespace for administrators
const adminNamespace = io.of('/admin');
// Support namespace for customer support
const supportNamespace = io.of('/support');

// ===== GENERAL NAMESPACE =====
generalNamespace.on('connection', (socket) => {
  console.log(`User connected to general namespace: ${socket.id}`);

  // Handle joining rooms
  socket.on('join-room', (roomName, username) => {
    socket.username = username;
    socket.join(roomName);
    socket.currentRoom = roomName;
    
    console.log(`${username} joined room: ${roomName}`);
    
    // Notify others in the room
    socket.to(roomName).emit('user-joined', {
      username: username,
      message: `${username} joined the room`
    });
    
    // Send room info to the user
    socket.emit('room-joined', {
      room: roomName,
      message: `You joined ${roomName}`
    });
  });

  // Handle leaving rooms
  socket.on('leave-room', () => {
    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit('user-left', {
        username: socket.username,
        message: `${socket.username} left the room`
      });
      socket.leave(socket.currentRoom);
      socket.currentRoom = null;
    }
  });

  // Handle chat messages
  socket.on('chat-message', (data) => {
    if (socket.currentRoom) {
      const messageData = {
        username: socket.username,
        message: data.message,
        timestamp: new Date().toLocaleTimeString()
      };
      
      // Send to all users in the current room
      generalNamespace.to(socket.currentRoom).emit('chat-message', messageData);
      console.log(`Message in ${socket.currentRoom}: ${socket.username}: ${data.message}`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit('user-left', {
        username: socket.username,
        message: `${socket.username} disconnected`
      });
    }
    console.log(`User disconnected from general namespace: ${socket.id}`);
  });
});

// ===== ADMIN NAMESPACE =====
adminNamespace.on('connection', (socket) => {
  console.log(`Admin connected: ${socket.id}`);

  socket.on('admin-join', (adminName) => {
    socket.adminName = adminName;
    socket.join('admin-room');
    
    socket.emit('admin-connected', {
      message: `Welcome, ${adminName}! You're now in the admin room.`
    });
    
    // Notify other admins
    socket.to('admin-room').emit('admin-joined', {
      adminName: adminName,
      message: `${adminName} joined the admin room`
    });
  });

  socket.on('admin-message', (data) => {
    const messageData = {
      adminName: socket.adminName,
      message: data.message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    adminNamespace.to('admin-room').emit('admin-message', messageData);
    console.log(`Admin message: ${socket.adminName}: ${data.message}`);
  });

  socket.on('disconnect', () => {
    if (socket.adminName) {
      socket.to('admin-room').emit('admin-left', {
        adminName: socket.adminName,
        message: `${socket.adminName} left the admin room`
      });
    }
    console.log(`Admin disconnected: ${socket.id}`);
  });
});

// ===== SUPPORT NAMESPACE =====
supportNamespace.on('connection', (socket) => {
  console.log(`Support agent connected: ${socket.id}`);

  socket.on('support-join', (agentName) => {
    socket.agentName = agentName;
    socket.join('support-room');
    
    socket.emit('support-connected', {
      message: `Welcome, ${agentName}! You're now in the support room.`
    });
    
    socket.to('support-room').emit('agent-joined', {
      agentName: agentName,
      message: `${agentName} joined the support room`
    });
  });

  socket.on('support-message', (data) => {
    const messageData = {
      agentName: socket.agentName,
      message: data.message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    supportNamespace.to('support-room').emit('support-message', messageData);
    console.log(`Support message: ${socket.agentName}: ${data.message}`);
  });

  socket.on('disconnect', () => {
    if (socket.agentName) {
      socket.to('support-room').emit('agent-left', {
        agentName: socket.agentName,
        message: `${socket.agentName} left the support room`
      });
    }
    console.log(`Support agent disconnected: ${socket.id}`);
  });
});

// ===== ROOMS EXPLANATION =====
// Rooms: Logical groups within a namespace
// 
// Available rooms in general namespace:
// - 'general' - Main chat room
// - 'tech' - Technology discussions
// - 'gaming' - Gaming discussions
// - 'random' - Random topics

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Socket.io server running on http://localhost:${PORT}`);
  console.log('\n=== NAMESPACES ===');
  console.log('1. /general - General chat with rooms');
  console.log('2. /admin - Admin-only namespace');
  console.log('3. /support - Support agents namespace');
  console.log('\n=== ROOMS (in general namespace) ===');
  console.log('- general, tech, gaming, random');
});
