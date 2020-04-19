import { Document, Types } from 'mongoose';

export interface IRecipe {
  createdAt: Date,
  title: String,
  time?: { hours?: Number, minutes?: Number },
  ingredients: String[],
  directions: String[],
}

export interface IRecipeModel extends IRecipe, Document { };

export interface ICleanedRecipe extends IRecipe {
  id: Types.ObjectId,
}
