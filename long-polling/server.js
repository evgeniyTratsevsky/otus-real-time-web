const express = require("express");
const cors = require("cors");
const app = express();
const delay = require("delay");

app.use(cors());

let dataQueue = [];

//Генерация новых данных каждые 5 секунд
setInterval(() => {
  const timeStamp = new Date().toISOString();
  dataQueue.push(`Новые данные на ${timeStamp}`);
}, 2000);

// Энпойнт для длинного запроса
app.get("/long-poll", async (req, res) => {
  while (true) {
    if (dataQueue.length > 0) {
      return  res.json({ success: true, data: dataQueue.shift() });
    }
    await delay(1000);
  }
});

// Слушаем сервер на порту 3000
app.listen(3000, () => {
  console.log("Сервер запущен на порту 3000");
});
