import express from 'express';

import usersRoutes from './users';
import recipeRoutes from './recipe';

const router = express.Router();

router.use('/users', usersRoutes)
router.use('/recipe', recipeRoutes)

export default router;
