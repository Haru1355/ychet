const gradeRepository = require('../data/repositories/gradeRepository');

module.exports = {
  getStudentGrades: async (studentId) => {
    const grades = await gradeRepository.getGradesByStudent(studentId);
    let average = null;
    if (grades.length > 0) {
      const sum = grades.reduce((s, g) => s + g.value, 0);
      average = Math.round((sum / grades.length) * 100) / 100;
    }
    return { grades, average };
  },
  addGrade: async (studentId, disciplineId, value) => {
    // Валидация входных данных (обработка исключительной ситуации)
    if (value < 2 || value > 5) {
      throw new Error('Оценка должна быть от 2 до 5');
    }
    const date = new Date().toISOString().split('T')[0];
    return await gradeRepository.addGrade(studentId, disciplineId, value, date);
  }
};