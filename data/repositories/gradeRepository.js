const db = require('../db');

module.exports = {
  getGradesByStudent: (studentId) => new Promise((resolve, reject) => {
    db.all(`SELECT g.*, d.name as discipline FROM grades g 
            JOIN disciplines d ON g.discipline_id = d.id 
            WHERE g.student_id = ?`, [studentId], (err, rows) => {
      if (err) reject(err); else resolve(rows);
    });
  }),
  
  addGrade: (studentId, disciplineId, value, date) => new Promise((resolve, reject) => {
    db.run(`INSERT INTO grades (student_id, discipline_id, value, date) VALUES (?, ?, ?, ?)`, 
      [studentId, disciplineId, value, date], function(err) {
        if (err) reject(err); else resolve(this.lastID);
    });
  })
};