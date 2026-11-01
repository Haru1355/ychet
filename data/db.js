const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database(path.join(__dirname, '..', 'database.sqlite'));

db.serialize(() => {
  // Таблица пользователей
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE,
    password_hash TEXT,
    role TEXT,
    full_name TEXT,
    group_name TEXT
  )`);

  // Таблица дисциплин
  db.run(`CREATE TABLE IF NOT EXISTS disciplines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    teacher_id INTEGER,
    FOREIGN KEY(teacher_id) REFERENCES users(id)
  )`);

  // Таблица оценок
  db.run(`CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    discipline_id INTEGER,
    value INTEGER,
    date TEXT,
    FOREIGN KEY(student_id) REFERENCES users(id),
    FOREIGN KEY(discipline_id) REFERENCES disciplines(id)
  )`);

  // Создание тестовых данных при первом запуске
  db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
    if (row.count === 0) {
      const hash = bcrypt.hashSync('123', 10);
      db.run(`INSERT INTO users (login, password_hash, role, full_name, group_name) VALUES 
        ('admin', '${hash}', 'admin', 'Иванов А.А.', NULL),
        ('teacher', '${hash}', 'teacher', 'Петров П.П.', NULL),
        ('student', '${hash}', 'student', 'Сидоров С.С.', 'ИС-21'),
        ('student2', '${hash}', 'student', 'Смирнов В.В.', 'ИС-21')`);
      
      db.run(`INSERT INTO disciplines (name, teacher_id) VALUES ('Математика', 2), ('Программирование', 2)`);
      
      db.run(`INSERT INTO grades (student_id, discipline_id, value, date) VALUES 
        (3, 1, 5, '2025-05-12'), 
        (3, 2, 4, '2025-05-13')`);
    }
  });
});

module.exports = db;