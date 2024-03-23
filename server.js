const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json()); // Для парсинга JSON-запросов

const ESP8266_IP = '192.168.140.230'; // Замените на IP-адрес вашего ESP8266
const ESP8266_PORT = '80'; // Замените на порт, если он отличается от 80

// Функция для отправки команды на ESP8266
async function sendCommandToESP8266(command) {
  try {
    const url = ('http://${ESP8266_IP}:${ESP8266_PORT}/${command}');
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке команды на ESP8266:', error);
    return null;
  }
}

// Обработчик POST-запросов на /alice-skill
app.post('/alice-skill', async (req, res) => {
  const command = req.body.request.command.toLowerCase(); // Получаем команду от Алисы

  if (command.includes('включи свет')) {
    const result = await sendCommandToESP8266('/on');
    const responseText = result ? 'Свет включен.' : 'Не удалось включить свет.';
    res.json(createAliceResponse(req, responseText));
  } else if (command.includes('выключи свет')) {
    const result = await sendCommandToESP8266('/off');
    const responseText = result ? 'Свет выключен.' : 'Не удалось выключить свет.';
    res.json(createAliceResponse(req, responseText));
  } else {
    res.json(createAliceResponse(req, 'Я не поняла команду.'));
  }
});

// Функция для создания стандартного ответа для Алисы
function createAliceResponse(req, text) {
  return {
    version: req.body.version,
    session: req.body.session,
    response: {
      text: text,
      end_session: false
    }
  };
}

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});