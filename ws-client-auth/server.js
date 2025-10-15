import { createServer } from 'http';
import { WebSocketServer } from 'ws';

function onSocketError(err) {
  console.error(err);
}

const server = createServer();
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', function connection(ws, request, client) {
  console.log(`Client ${client.id} (${client.name}) connected`);
  
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log(`Received message ${data} from user ${client.name} (${client.id})`);
    
    // Echo the message back with client info
    ws.send(`Echo from server: ${data} (sent by ${client.name})`);
  });

  ws.on('close', function close() {
    console.log(`Client ${client.name} (${client.id}) disconnected`);
  });

  // Send welcome message
  ws.send(`Welcome ${client.name}! You are authenticated as user ${client.id}`);
});

server.on('upgrade', function upgrade(request, socket, head) {
  socket.on('error', onSocketError);

  // Authenticate the client
  authenticate(request, function next(err, client) {
    if (err || !client) {
      console.log('Authentication failed:', err?.message || 'No client provided');
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    console.log(`Authentication successful for client: ${client.name}`);
    socket.removeListener('error', onSocketError);

    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request, client);
    });
  });
});

// Simple authentication function
function authenticate(request, callback) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const token = url.searchParams.get('token');
  const username = url.searchParams.get('username');

  // Simple token-based authentication
  // In a real application, you would validate against a database or JWT
  const validTokens = {
    'user123': { id: 'user123', name: 'Alice', role: 'user' },
    'admin456': { id: 'admin456', name: 'Bob', role: 'admin' },
    'guest789': { id: 'guest789', name: 'Charlie', role: 'guest' }
  };

  if (!token || !username) {
    return callback(new Error('Missing token or username parameter'));
  }

  const client = validTokens[token];
  if (!client) {
    return callback(new Error('Invalid token'));
  }

  if (client.name !== username) {
    return callback(new Error('Username does not match token'));
  }

  // Simulate async authentication (e.g., database lookup)
  setTimeout(() => {
    callback(null, client);
  }, 100);
}

server.listen(8080, () => {
  console.log('WebSocket server with authentication running on port 8080');
  console.log('Connect with: ws://localhost:8080/?token=user123&username=Alice');
  console.log('Available tokens: user123, admin456, guest789');
});
