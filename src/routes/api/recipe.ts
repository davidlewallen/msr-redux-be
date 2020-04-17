import express from 'express';

const router = express.Router();

import auth from '../auth'
import { createRecipe, deleteRecipe } from '../../controllers/recipe';

router.post('/', auth.required, createRecipe)
router.delete('/:recipeId', auth.required, deleteRecipe)

export default router;
