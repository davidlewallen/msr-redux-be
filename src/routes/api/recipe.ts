import express from 'express';

const router = express.Router();

import auth from '../auth'
import { createRecipe, getRecipes, deleteRecipe } from '../../controllers/recipe';

router.post('/', auth.required, createRecipe);
router.get('/', auth.required, getRecipes);
router.delete('/:recipeId', auth.required, deleteRecipe);

export default router;
