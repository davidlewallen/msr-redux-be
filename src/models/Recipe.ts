import { Schema, Model, model } from 'mongoose';

import { IRecipeModel } from './interface/recipe';

const RecipeSchema: Schema = new Schema({
  created: Date,
  title: String,
  time: { hours: Number, minutes: Number },
  ingredients: [String],
  directions: [String],
})

export const Recipe: Model<IRecipeModel> = model<IRecipeModel>('Recipe', RecipeSchema)
