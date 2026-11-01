const express = require('express');
const session = require('express-session');
const path = require('path');
const uiRoutes = require('./ui/routes/index');

const app = express();

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'ui', 'views'));

// Middleware для обработки данных форм и статических файлов
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'ui', 'public')));

// Настройка сессий для авторизации
app.use(session({
  secret: 'secret_key_for_ych_ycp',
  resave: false,
  saveUninitialized: true
}));

// Подключение маршрутов
app.use('/', uiRoutes);

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});