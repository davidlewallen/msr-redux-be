import { Request, Response } from 'express';
import { Model, model, Types } from 'mongoose';

import { findRecipesByUser } from './shared';
import { IRecipeModel } from '../models/interface/recipe';
import { IUserModel } from '../models/interface/user'

const Recipe: Model<IRecipeModel> = model('Recipe');
const User: Model<IUserModel> = model('User');

const addRecipeIdToUser = (userID: Types.ObjectId, recipeId: Types.ObjectId) => {
  return User.findById({ _id: userID })
    .then(user => {
      if (!user) return;

      user.recipes.push(recipeId);

      return user.save();
    })
    .catch(err => {
      console.log('err', err);

      return err;
    })
}

export const createRecipe = (req: Request, res: Response) => {
  const { body } = req;
  const { title, ingredients, directions }: { title: string, ingredients: string[], directions: string[] } = body;
  // @ts-ignore
  const { meta } = req;
  const { id: userID }: { id: Types.ObjectId } = meta;

  if (!title) return res.status(400).json({ errors: { title: 'is required' } })
  if (!ingredients) return res.status(400).json({ errors: { ingredients: 'is required' } })
  if (!directions) return res.status(400).json({ errors: { directions: 'is required' } })

  const recipe = new Recipe({ title, ingredients, directions })

  return recipe.save()
    .then(recipe => addRecipeIdToUser(userID, recipe._id))
    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.log('recipe -> createRecipe error:', err);

      return res.status(500).json({ errors: err })
    })
}

export const deleteRecipe = (req: Request, res: Response) => {
  const { params } = req
  const { recipeId } = params;
  // @ts-ignore
  const { meta } = req
  const { id: userID }: { id: Types.ObjectId } = meta;


  User.findById(userID)
    .then(user => {
      if (!user) return;

      const filteredRecipes = user.recipes.filter(recipe => recipe.toHexString() !== recipeId)

      user.recipes = filteredRecipes;

      return user.save()
    })
    .then(() => res.sendStatus(200))
    .catch(err => res.send(500).json({ errors: err }))
}

export const getRecipes = (req: Request, res: Response) => {
  // @ts-ignore
  const { meta } = req;
  const { id: userID }: { id: Types.ObjectId } = meta;

  return findRecipesByUser(userID)
    .then(recipes => res.status(200).json(recipes))
    .catch(err => {
      console.log('Error:', err);

      return res.status(500).json({ errors: err })
    })
}
