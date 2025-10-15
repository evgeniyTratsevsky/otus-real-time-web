// Authentication middleware for WebSocket connections
// This can be extended to support JWT, session-based auth, etc.

export class WebSocketAuth {
  constructor(options = {}) {
    this.validTokens = options.validTokens || {};
    this.sessionStore = options.sessionStore || new Map();
    this.jwtSecret = options.jwtSecret;
  }

  // Token-based authentication
  authenticateByToken(request, callback) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token');
    const username = url.searchParams.get('username');

    if (!token || !username) {
      return callback(new Error('Missing token or username parameter'));
    }

    const client = this.validTokens[token];
    if (!client) {
      return callback(new Error('Invalid token'));
    }

    if (client.name !== username) {
      return callback(new Error('Username does not match token'));
    }

    // Simulate async authentication
    setTimeout(() => {
      callback(null, client);
    }, 100);
  }

  // Session-based authentication
  authenticateBySession(request, callback) {
    const sessionId = this.extractSessionId(request);
    
    if (!sessionId) {
      return callback(new Error('No session ID provided'));
    }

    const session = this.sessionStore.get(sessionId);
    if (!session || session.expires < Date.now()) {
      return callback(new Error('Invalid or expired session'));
    }

    setTimeout(() => {
      callback(null, session.user);
    }, 50);
  }

  // JWT-based authentication
  authenticateByJWT(request, callback) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return callback(new Error('No JWT token provided'));
    }

    const token = authHeader.substring(7);
    
    try {
      // In a real implementation, you would verify the JWT here
      // const decoded = jwt.verify(token, this.jwtSecret);
      const decoded = this.decodeJWT(token); // Mock implementation
      
      setTimeout(() => {
        callback(null, decoded);
      }, 50);
    } catch (error) {
      callback(new Error('Invalid JWT token'));
    }
  }

  // Extract session ID from various sources
  extractSessionId(request) {
    // Check URL parameters
    const url = new URL(request.url, `http://${request.headers.host}`);
    const sessionId = url.searchParams.get('sessionId');
    if (sessionId) return sessionId;

    // Check cookies
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      return cookies.sessionId;
    }

    return null;
  }

  // Mock JWT decode function
  decodeJWT(token) {
    // This is a mock implementation
    // In reality, you would use a proper JWT library
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return {
      id: payload.sub,
      name: payload.name,
      role: payload.role,
      exp: payload.exp
    };
  }

  // Create a session
  createSession(user, expiresIn = 3600000) { // 1 hour default
    const sessionId = this.generateSessionId();
    const session = {
      user,
      expires: Date.now() + expiresIn,
      createdAt: Date.now()
    };
    
    this.sessionStore.set(sessionId, session);
    return sessionId;
  }

  // Generate a random session ID
  generateSessionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Clean up expired sessions
  cleanupExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessionStore.entries()) {
      if (session.expires < now) {
        this.sessionStore.delete(sessionId);
      }
    }
  }
}
