import { Model, model } from 'mongoose';
import passport from 'passport'
import express from 'express'
import validator from 'validator'

import auth from '../auth'
import usersControllers from '../../controllers/users'
import { IUserModel } from '../../models/interface/users';

const Users: Model<IUserModel> = model('Users');

const router = express.Router();

// POST new user route (optional, everyone has access)
router.post('/', (req, res, next) => {
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
    // @ts-ignore
    payload: { id },
  } = req;

  return Users.findById(id).then(user => {
    if (!user) {
      return res.sendStatus(400);
    }

    return res.json(user.getUser());
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

        res.cookie('token', user.toAuthJSON().token)
        return res.json({ user: user });
      }

      return res.status(400).json({
        errors: { user: info }
      });
    }
  )(req, res, next);
});

router.get('/verify/:id/:key', auth.optional, usersControllers.verifyUser);

export default router;
