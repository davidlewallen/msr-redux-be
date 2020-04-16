import { Model, model } from 'mongoose';
import passport from 'passport'
import express from 'express'
import validator from 'validator'

import auth from '../auth'
import { createUser, getUser, login, verifyUser } from '../../controllers/users'
import { IUserModel } from '../../models/interface/user';

const User: Model<IUserModel> = model('User');

const router = express.Router();

// POST new user route (optional, everyone has access)
router.post('/', createUser);

// GET current route (required, only authenticated users have access)
router.get('/', auth.required, getUser);

// POST login route (optional, everyone has access)
router.post('/login', auth.optional, login)

router.get('/verify/:id/:key', auth.optional, verifyUser);

export default router;
