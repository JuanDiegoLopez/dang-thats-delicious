const moongose = require('mongoose');
const User = moongose.model('User');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Log In' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'The email provided is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extesion: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody('password', 'Password cannot be blank!').notEmpty();
  req
    .checkBody('password-confirm', 'Confirmed password cannot be blank!')
    .notEmpty();
  req
    .checkBody('password-confirm', 'Your passwords do not match!')
    .equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash(
      'error',
      errors.map((err) => err.msg)
    );
    res.render('register', {
      title: 'Register',
      body: req.body,
      flashes: req.flash(),
    });
    return;
  }

  next();
};

exports.register = async (req, res, next) => {
  console.log(req.body);
  const user = new User({ name: req.body.name, email: req.body.email });

  await User.register(user, req.body.password);

  next();
};

exports.account = (req, res) => {
  res.render('account', { title: 'Edit your profile ' });
};

exports.updateAccount = async (req, res) => {
  const id = req.user._id;
  const updates = {
    name: req.body.name,
    email: req.body.email,
  };

  await User.findOneAndUpdate(
    { _id: id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );

  req.flash('success', 'Profile updated!');
  res.redirect('back');
};
