const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../../data/db');
const gradeService = require('../../business/gradeService');
const { checkAuth, checkRole } = require('../../common/middleware');

// Авторизация
router.get('/login', (req, res) => res.render('login', { error: null }));
router.post('/login', (req, res) => {
  const { login, password } = req.body;
  db.get(`SELECT * FROM users WHERE login = ?`, [login], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.render('login', { error: 'Неверный логин или пароль' });
    }
    req.session.user = { id: user.id, role: user.role, name: user.full_name };
    res.redirect('/');
  });
});
router.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/login'); });

// Главная страница (редирект по ролям)
router.get('/', checkAuth, (req, res) => {
  if (req.session.user.role === 'student') return res.redirect('/cabinet');
  if (req.session.user.role === 'teacher') return res.redirect('/journal');
  if (req.session.user.role === 'admin') return res.redirect('/admin');
});

// Личный кабинет студента
router.get('/cabinet', checkAuth, checkRole(['student']), async (req, res) => {
  try {
    const data = await gradeService.getStudentGrades(req.session.user.id);
    res.render('cabinet', { user: req.session.user, ...data });
  } catch (e) {
    res.status(500).send("Ошибка БД");
  }
});

// Журнал преподавателя
router.get('/journal', checkAuth, checkRole(['teacher']), (req, res) => {
  db.all(`SELECT * FROM disciplines WHERE teacher_id = ?`, [req.session.user.id], (err, disciplines) => {
    db.all(`SELECT * FROM users WHERE role = 'student'`, (err, students) => {
      db.all(`SELECT g.*, u.full_name, d.name as discipline FROM grades g 
              JOIN users u ON g.student_id = u.id 
              JOIN disciplines d ON g.discipline_id = d.id`, (err, grades) => {
        res.render('journal', { user: req.session.user, disciplines, students, grades });
      });
    });
  });
});

// Выставление оценки
router.post('/journal/add', checkAuth, checkRole(['teacher']), async (req, res) => {
  const { studentId, disciplineId, value } = req.body;
  try {
    await gradeService.addGrade(parseInt(studentId), parseInt(disciplineId), parseInt(value));
    res.redirect('/journal');
  } catch (error) {
    res.status(400).send(`Ошибка: ${error.message}. <a href="/journal">Назад</a>`);
  }
});

// Панель администратора
router.get('/admin', checkAuth, checkRole(['admin']), (req, res) => {
  db.all(`SELECT * FROM users`, (err, users) => {
    db.all(`SELECT d.*, u.full_name as teacher_name FROM disciplines d JOIN users u ON d.teacher_id = u.id`, (err, disciplines) => {
      res.render('admin', { user: req.session.user, users, disciplines });
    });
  });
});

module.exports = router;