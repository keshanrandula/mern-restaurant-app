export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  } else {
    res.status(401);
    return next(new Error('Not authorized as an admin'));
  }
};
