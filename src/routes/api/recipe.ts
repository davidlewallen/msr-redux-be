import express from 'express';

const router = express.Router();

import auth from '../auth'
import { createRecipe } from '../../controllers/recipe';

router.post('/', auth.required, createRecipe)

export default router;
