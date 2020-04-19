import express from 'express'

import auth from '../auth'
import { createUser, getUser, login, verifyUser } from '../../controllers/users'

const router = express.Router();

// POST new user route (optional, everyone has access)
router.post('/', createUser);

// GET current route (required, only authenticated users have access)
router.get('/', auth.required, getUser);

// POST login route (optional, everyone has access)
router.post('/login', auth.optional, login)

router.get('/verify/:id/:key', auth.optional, verifyUser);

export default router;
