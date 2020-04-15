import { Model, model } from 'mongoose';
import passport from 'passport'
import * as passportLocal from 'passport-local'

import { IUserModel } from '../models/interface/user'

const LocalStrategy = passportLocal.Strategy

const User: Model<IUserModel> = model('User');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'user[email]',
      passwordField: 'user[password]',
    },
    (email: string, password: string, done) => {
      User.findOne({ email })
        .then(user => {
          if (!user || !user.validatePassword(password)) {
            return done('email or password is invalid', false)
          }

          return done(null, user);
        })
        .catch(done);
    }
  )
);
