# Socket.io Chat - Namespaces & Rooms Demo

A simple Socket.io chat application demonstrating **Namespaces** and **Rooms** concepts with clean, easy-to-understand code.

## Socket.io Features

### Namespace
**Used for separating logic on the server**

Namespaces allow you to create separate communication channels on the same server. Each namespace has its own event handlers and can be accessed via different URLs.

### Room  
**Logical groups within a namespace**

Rooms are subdivisions within a namespace that allow you to group users together for targeted messaging.

## Project Structure

```
socket.io/
├── package.json          # Dependencies (socket.io, express)
├── server.js             # Server with namespaces and rooms
├── public/
│   └── index.html        # Client interface
└── README.md             # This file
```

## Implementation

### Server (`server.js`)

#### Namespaces Created:
1. **`/general`** - General chat namespace with rooms
2. **`/admin`** - Admin-only namespace  
3. **`/support`** - Support agents namespace

#### Rooms in General Namespace:
- `general` - Main chat room
- `tech` - Technology discussions
- `gaming` - Gaming discussions  
- `random` - Random topics

#### Key Features:
- **Namespace separation**: Each namespace has isolated logic
- **Room management**: Users can join/leave rooms within namespaces
- **User identification**: Each connection is associated with a username
- **Real-time messaging**: Messages are sent to specific rooms
- **Connection handling**: Proper connect/disconnect event handling

### Client (`public/index.html`)

#### Features:
- **Tabbed interface** for different namespaces
- **Room selection** for general namespace
- **Real-time messaging** with message history
- **User status indicators** showing connection state
- **Clean UI** with color-coded message types

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open the client:**
   Navigate to `http://localhost:3000`

## Usage Examples

### General Chat (Namespace + Rooms)
1. Enter username and click "Connect to General"
2. Select a room (general, tech, gaming, random)
3. Click "Join Room" 
4. Start chatting with others in the same room

### Admin Chat (Namespace Only)
1. Switch to "Admin" tab
2. Enter admin name and connect
3. All admins are automatically in the "admin-room"
4. Send messages visible to all admins

### Support Chat (Namespace Only)  
1. Switch to "Support" tab
2. Enter agent name and connect
3. All support agents are in the "support-room"
4. Collaborate on customer support

## Code Explanation

### Namespace Creation
```javascript
// Create different namespaces
const generalNamespace = io.of('/general');
const adminNamespace = io.of('/admin');
const supportNamespace = io.of('/support');
```

### Room Management
```javascript
// Join a room within a namespace
socket.on('join-room', (roomName, username) => {
  socket.join(roomName);  // Join the room
  socket.currentRoom = roomName;  // Track current room
});

// Send message to specific room
generalNamespace.to(socket.currentRoom).emit('chat-message', messageData);
```

### Client Connection
```javascript
// Connect to specific namespace
const generalSocket = io('/general');
const adminSocket = io('/admin');
const supportSocket = io('/support');
```

## Key Concepts Demonstrated

1. **Namespace Isolation**: Each namespace operates independently
2. **Room Broadcasting**: Messages sent to specific rooms within namespaces
3. **User Management**: Track users and their current rooms
4. **Event Handling**: Proper connect/disconnect and message events
5. **Real-time Communication**: Instant message delivery and updates

## Extending the Example

You can extend this example by adding:

- **Authentication**: Require login before joining namespaces
- **Private Messages**: Direct user-to-user messaging
- **File Sharing**: Send files through WebSocket
- **User Presence**: Show online/offline status
- **Message History**: Persist messages in database
- **Moderation**: Admin controls for message filtering

## Benefits of This Architecture

- **Scalable**: Easy to add new namespaces and rooms
- **Organized**: Clear separation of different chat types
- **Flexible**: Users can be in multiple rooms simultaneously
- **Maintainable**: Clean, readable code structure
- **Educational**: Perfect for understanding Socket.io concepts
