const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = mongoose.model('User');
const { sendEmail } = require('../handlers/mail');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!',
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }

  req.flash('error', 'You must be logged in!');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    req.flash('error', 'No account with that email exists!');
    return res.redirect('/login');
  }

  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;

  await user.save();

  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

  await sendEmail({
    user,
    resetURL,
    filename: 'password-reset',
    subject: 'Password Reset',
  });

  req.flash('success', `You have been emailed a password reset link.`);
  res.redirect('/login');
};

exports.checkResetToken = async (req, res, next) => {
  const token = req.params.token;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired!');
    return res.redirect('/login');
  }

  res.locals.user = user;
  next();
};

exports.checkPasswordsMatch = (req, res, next) => {
  const password = req.body.password;
  const passwordConfirm = req.body['password-confirm'];

  if (password !== passwordConfirm) {
    req.flash('error', 'Passwords do not match!');
    return res.redirect('back');
  }

  next();
};

exports.reset = async (req, res) => {
  delete res.locals.user;
  res.render('reset', { title: 'Reset Password' });
};

exports.updatePassword = async (req, res) => {
  const user = res.locals.user;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.setPassword(req.body.password);

  const updatedUser = await user.save();

  delete res.locals.user;
  await req.login(updatedUser);

  req.flash('success', 'Your password has been reset!');
  res.redirect('/');
};
