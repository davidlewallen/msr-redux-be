const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const validator = require('validator');

const auth = require('../auth');
const usersControllers = require('../../controllers/users');

const Users = mongoose.model('Users');

// POST new user route (optional, everyone has access)
router.post('/', auth.optional, (req, res, next) => {
  const {
    body: { user },
  } = req;

  if (!user.email || !user.email.length) {
    return res.status(422).json({
      errors: { email: 'is required' },
    });
  }

  if (!user.password || !user.password.length) {
    return res.status(422).json({
      errors: { password: 'is required' },
    });
  }

  if (!validator.isEmail(user.email)) {
    return res.status(400).json({
      errors: { email: 'must be valid email address' },
    });
  }

  Users.findOne({ email: user.email }).then(existingUser => {
    const alreadyRegistered = !!existingUser;

    if (alreadyRegistered) {
      return res.status(409).json({ errors: { email: 'already exist' } });
    } else {
      const finalUser = new Users(user);

      finalUser.setPassword(user.password);

      return finalUser
        .save()
        .then(user => usersControllers.sendVerificationEmail(user))
        .then(() => res.json({ user: finalUser.toAuthJSON() }))
        .catch(err => console.log('err', err));
    }
  });
});

// GET current route (required, only authenticated users have access)
router.get('/', auth.required, (req, res, next) => {
  const {
    payload: { id },
  } = req;

  return Users.findById(id).then(user => {
    if (!user) {
      return res.sendStatus(400);
    }

    return res.json({ user: user.toAuthJSON() });
  });
});

// POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
  const {
    body: { user },
  } = req;

  if (!user.email) {
    return res.status(422).json({
      errors: { email: 'is required' },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: { password: 'is required' },
    });
  }

  return passport.authenticate(
    'local',
    { session: false },
    (err, passportUser, info) => {
      if (err) {
        return next(err);
      }

      if (passportUser) {
        const user = passportUser;

        user.token = passportUser.generateJWT();

        return res.json({ user: user.toAuthJSON() });
      }

      return status(400).info;
    }
  )(req, res, next);
});

router.get('/verify/:id/:key', auth.optional, usersControllers.verifyUser);

module.exports = router;
