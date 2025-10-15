# WebSocket Client Authentication Example

This example demonstrates WebSocket server implementation with client authentication, based on the [ws library examples](https://github.com/websockets/ws/tree/master/examples/express-session-parse).

## Features

- **Token-based Authentication**: Clients must provide valid tokens to connect
- **User Identification**: Each connection is associated with a specific user
- **Error Handling**: Proper error handling for authentication failures
- **Real-time Messaging**: Authenticated clients can send and receive messages

## Files

- `server.js` - WebSocket server with authentication
- `auth-middleware.js` - Reusable authentication middleware
- `index.html` - Client interface for testing authentication
- `package.json` - Project dependencies

## How It Works

1. **Server Setup**: Creates an HTTP server and WebSocket server with `noServer: true`
2. **Upgrade Handling**: Intercepts WebSocket upgrade requests
3. **Authentication**: Validates client credentials before allowing connection
4. **Connection Management**: Associates authenticated users with WebSocket connections

## Authentication Methods

The middleware supports multiple authentication methods:

- **Token Authentication**: Simple token-based auth via URL parameters
- **Session Authentication**: Session-based authentication
- **JWT Authentication**: JSON Web Token authentication

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open `index.html` in your browser

4. Use one of the test tokens:
   - `user123` for Alice (user role)
   - `admin456` for Bob (admin role)  
   - `guest789` for Charlie (guest role)

## Test Tokens

The server includes predefined test tokens for demonstration:

| Token | Username | Role |
|-------|----------|------|
| user123 | Alice | user |
| admin456 | Bob | admin |
| guest789 | Charlie | guest |

## Connection URL Format

```
ws://localhost:8080/?token=user123&username=Alice
```

## Error Handling

- **401 Unauthorized**: Invalid or missing authentication credentials
- **Connection Errors**: Proper error logging and client notification
- **Authentication Failures**: Clear error messages for debugging

## Extending the Example

You can extend this example by:

- Adding JWT token validation
- Implementing database-backed user authentication
- Adding role-based message filtering
- Implementing session management
- Adding rate limiting for authenticated connections
