import { Document, Types } from 'mongoose'

export interface IUser {
  email?: string,
  hash?: string,
  salt?: string,
  verification: {
    status: boolean,
    key: string,
  }
}

export interface IUserModel extends IUser, Document {
  setPassword(password: string): void,
  validatePassword(password: string): boolean,
  generateJWT(): string
  toAuthJSON(): {
    _id: string,
    email: string,
    token: string
  }
}
