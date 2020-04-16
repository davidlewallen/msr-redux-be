import jwt from 'express-jwt'
import { Request } from 'express';

const getTokenFromHeaders = (req: Request) => {
  console.log('called')
  const {
    headers: { authorization },
  } = req;

  if (authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }

  return null;
};

const auth = {
  required: jwt({
    secret: process.env.JWT_SECRET_REQUIRED || '',
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
  }),
  optional: jwt({
    secret: process.env.JWT_SECRET_OPTIONAL || '',
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
    credentialsRequired: false,
  }),
};

export default auth;
