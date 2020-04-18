import { Request, Response, NextFunction } from 'express'
import mailgun from 'mailgun-js';
import { Model, model } from 'mongoose';
import { v1 as uuidv1 } from 'uuid';
import validator from 'validator';
import passport from 'passport'

import { findRecipesByList } from './shared';
import { IUserModel } from '../models/interface/user';

const User: Model<IUserModel> = model('User');

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY || '',
  domain: 'mail.mysavedrecipes.com',
});

const setUserToUnverified = (id: string) => {
  const verificationKey = uuidv1();

  return User.findByIdAndUpdate(id, {
    verification: {
      status: false,
      key: verificationKey,
    },
  }).then(() => verificationKey);
};

const setUserToBeVerified = (id: string) => {
  return User.findByIdAndUpdate(id, {
    verification: { status: true },
  });
};

export const verifyUser = (req: Request, res: Response) => {
  const {
    params: { id, key },
  } = req;

  if (!id)
    return res.status(400).json({
      errors: { id: 'is required' },
    });

  if (!key)
    return res.status(400).json({
      errors: { key: 'is required' },
    });

  return User.findById(id).then(user => {
    if (user === null) {
      return res.status(400).json({ errors: { user: 'does not exist' } });
    }

    if (user.verification.status) {
      return res.status(400).json({ errors: { user: 'is already verified' } });
    }

    if (user.verification.key !== key) {
      return res
        .status(400)
        .json({ errors: { key: 'does not match saved verification key' } });
    }
    return setUserToBeVerified(id).then(() => res.sendStatus(200));
  });
};

const sendVerificationEmail = (user: IUserModel) => {
  return setUserToUnverified(user._id).then(verificationKey => {
    const verificationParams = `id=${user._id}&key=${verificationKey}`;

    const verificationLink = 'TODO: Update me for FE ' + verificationParams;

    const emailTemplate = {
      from: 'My Saved Recipes <support@mail.mysavedrecipes.com>',
      to: user.email || '',
      subject: 'My Saved Recipes - Email Verification',
      text: `
      Thank you for signing up with My Saved Recipes!
      Please follow the link below to verify your account.
      ${verificationLink} /${user._id}/${verificationKey}
    `,
    };

    mg.messages().send(emailTemplate, (error: { statusCode: number, message: string }, body) => {
      if (isDevelopment) {
        console.log(`Mailgun Send Verification Email: ${body}`);
      }
    });
  });
};

export const createUser = (req: Request, res: Response) => {
  const { body } = req;
  const { user } = body;


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

  User.findOne({ email: user.email })
    .then(existingUser => {
      const alreadyRegistered = !!existingUser;

      if (alreadyRegistered) {
        return res.status(409).json({ errors: { email: 'already exist' } });
      } else {
        const finalUser = new User(user);

        finalUser.setPassword(user.password);

        return finalUser
          .save()
          .then(user => sendVerificationEmail(user))
          // should we send back the user or 200?
          // .then(() => res.json({ user: finalUser.toAuthJSON() }))
          .then(() => res.sendStatus(200))
          .catch(err => {
            console.log('err', err);
            res.status(500).json({ errors: err })
          })
      }
    });
}

export const getUser = (req: Request, res: Response) => {
  // @ts-ignore
  const { meta } = req;
  const { id } = meta;

  return User.findById(id).then(user => {
    if (!user) {
      return res.sendStatus(400);
    }

    return findRecipesByList(user.recipes)
      .then(recipes => {
        const userCopy = user.getUser();

        userCopy.recipes = recipes;

        return res.status(200).json(userCopy);
      })
      .catch(err => res.status(500).json({ errors: err }))
  });
}

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { body } = req;
  const { user } = body;


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
}
