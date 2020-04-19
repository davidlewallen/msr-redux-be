import { Document, Types } from 'mongoose'

import { ICleanedRecipe } from './recipe'

export interface IUser {
  email?: string,
  hash?: string,
  salt?: string,
  verification: {
    status: boolean,
    key: string,
  }
  recipes: Types.ObjectId[]
}

export interface IUserModel extends IUser, Document {
  setPassword(password: string): void,
  validatePassword(password: string): boolean,
  generateJWT(): string
  toAuthJSON(): {
    _id: string,
    email: string,
    token: string
  },
  getUser(): {
    id: string,
    email: string,
    isVerified: boolean
    recipes: ICleanedRecipe[],
  }
}
