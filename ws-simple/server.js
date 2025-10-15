const WebSocket = require('ws');

// Создаем WebSocket-сервер на порту 8080
const server = new WebSocket.Server({ port: 8080 });

console.log('WebSocket сервер запущен на ws://localhost:8080');

// Обработка подключения клиента
server.on('connection', (socket) => {
  console.log('Клиент подключен');

  // Отправляем приветственное сообщение клиенту
  socket.send('Добро пожаловать на WebSocket сервер!');

  // Обработка входящих сообщений от клиента
  socket.on('message', (message) => {
    console.log(`Получено сообщение: ${message}`);

    // Отправляем ответ клиенту
    socket.send(`Эхо: ${message}`);
  });

  // Обработка отключения клиента
  socket.on('close', () => {
    console.log('Клиент отключился');
  });

  // Обработка ошибок
  socket.on('error', (error) => {
    console.error('Ошибка WebSocket:', error);
  });
});
