import { Document } from 'mongoose';

export interface IRecipe {
  created: Date,
  title: String,
  time?: { hours?: Number, minutes?: Number },
  ingredients: String[],
  directions: String[],
}

export interface IRecipeModel extends IRecipe, Document { };