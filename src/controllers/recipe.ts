import { Request, Response } from 'express';
import { Model, model, Types } from 'mongoose';
import { decode } from 'jsonwebtoken'

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
  const { body, cookies } = req;
  const { token } = cookies;
  const { title, ingredients, directions }: { title: string, ingredients: string[], directions: string[] } = body;

  const decodedToken = decode(token);
  // @ts-ignore
  const { id: userID }: { userID: Types.ObjectId } = decodedToken



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
  const { params, cookies } = req
  const { recipeId } = params;
  const { token } = cookies;

  const decodeToken = decode(token)
  // @ts-ignore
  const { id: userID }: { userID: Types.ObjectId } = decodeToken


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
