import jwt from 'express-jwt'
import { Request } from 'express';

const getTokenFromCookies = (req: Request): string => {
  const { cookies } = req;

  return cookies.token
}

const auth = {
  required: jwt({
    secret: process.env.JWT_SECRET_REQUIRED || '',
    userProperty: 'meta',
    getToken: getTokenFromCookies,
  }),
  optional: jwt({
    secret: process.env.JWT_SECRET_OPTIONAL || '',
    userProperty: 'meta',
    getToken: getTokenFromCookies,
    credentialsRequired: false,
  }),
};

export default auth;
