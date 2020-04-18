import { Schema, Model, model } from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { IUserModel } from './interface/user'

const { JWT_SECRET_REQUIRED = '' } = process.env

const UserSchema: Schema = new Schema({
  email: String,
  hash: String,
  salt: String,
  verification: {
    status: Boolean,
    key: String,
  },
  recipes: { type: [Schema.Types.ObjectId], default: [] }
});

UserSchema.methods.setPassword = function (password: string) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex');
};

UserSchema.methods.validatePassword = function (password: string) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex');

  return this.hash === hash;
};

UserSchema.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);

  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      email: this.email,
      id: this._id,
      exp: parseInt(String(expirationDate.getTime() / 1000), 10),
    },
    JWT_SECRET_REQUIRED
  );
};

UserSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    email: this.email,
    token: this.generateJWT(),
  };
};

UserSchema.methods.getUser = function () {
  return {
    id: this._id,
    email: this.email,
    isVerified: this.verification.status
  }
}

export const User: Model<IUserModel> = model<IUserModel>('User', UserSchema);
