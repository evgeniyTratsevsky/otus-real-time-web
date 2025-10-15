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
const generalNamespace = io.of('/general');
const adminNamespace = io.of('/admin');
const supportNamespace = io.of('/support');

// ===== GENERAL NAMESPACE =====
generalNamespace.on('connection', (socket) => {
  console.log(`User connected to general namespace: ${socket.id}`);

  socket.on('join-room', (roomName, username) => {
    socket.username = username;
    socket.join(roomName);
    socket.currentRoom = roomName;
    
    console.log(`${username} joined room: ${roomName}`);
    
    // Notify others in the SAME room only
    socket.to(roomName).emit('user-joined', {
      username: username,
      message: `${username} joined the room`
    });
    
    socket.emit('room-joined', {
      room: roomName,
      message: `You joined ${roomName}`
    });
  });

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

  // Regular room message (isolated to current room)
  socket.on('chat-message', (data) => {
    if (socket.currentRoom) {
      const messageData = {
        username: socket.username,
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
        room: socket.currentRoom
      };
      
      // Send ONLY to users in the same room
      generalNamespace.to(socket.currentRoom).emit('chat-message', messageData);
      console.log(`Room message in ${socket.currentRoom}: ${socket.username}: ${data.message}`);
    }
  });

  // Cross-room message (sent to ALL rooms in general namespace)
  socket.on('broadcast-message', (data) => {
    const messageData = {
      username: socket.username,
      message: data.message,
      timestamp: new Date().toLocaleTimeString(),
      type: 'broadcast'
    };
    
    // Send to ALL users in general namespace (all rooms)
    generalNamespace.emit('broadcast-message', messageData);
    console.log(`Broadcast message: ${socket.username}: ${data.message}`);
  });

  // Cross-namespace message (admin can send to general users)
  socket.on('admin-announcement', (data) => {
    if (socket.username === 'Admin1' || socket.username === 'Admin2') {
      const messageData = {
        username: socket.username,
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
        type: 'admin-announcement'
      };
      
      // Send to ALL users in general namespace
      generalNamespace.emit('admin-announcement', messageData);
      console.log(`Admin announcement: ${socket.username}: ${data.message}`);
    }
  });

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
    
    // Send to admin room only
    adminNamespace.to('admin-room').emit('admin-message', messageData);
    console.log(`Admin message: ${socket.adminName}: ${data.message}`);
  });

  // Admin can send announcements to general namespace
  socket.on('send-announcement', (data) => {
    const messageData = {
      adminName: socket.adminName,
      message: data.message,
      timestamp: new Date().toLocaleTimeString(),
      type: 'admin-announcement'
    };
    
    // Send to ALL users in general namespace
    generalNamespace.emit('admin-announcement', messageData);
    console.log(`Admin announcement to general: ${socket.adminName}: ${data.message}`);
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

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Socket.io server running on http://localhost:${PORT}`);
  console.log('\n=== COMMUNICATION RULES ===');
  console.log('❌ Users in different namespaces CANNOT communicate directly');
  console.log('❌ Users in different rooms CANNOT communicate directly');
  console.log('✅ Users in same room CAN communicate');
  console.log('✅ Broadcast messages can reach all users in same namespace');
  console.log('✅ Admins can send announcements to general namespace');
  console.log('\n=== NAMESPACES ===');
  console.log('1. /general - General chat with rooms');
  console.log('2. /admin - Admin-only namespace');
  console.log('3. /support - Support agents namespace');
  console.log('\n=== ROOMS (in general namespace) ===');
  console.log('- general, tech, gaming, random');
});
