module.exports = {
  checkAuth: (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    next();
  },
  checkRole: (roles) => {
    return (req, res, next) => {
      if (!req.session.user || !roles.includes(req.session.user.role)) {
        return res.status(403).send('Недостаточно прав для выполнения операции');
      }
      next();
    };
  }
};