import { Schema, Model, model } from 'mongoose';

import { IRecipeModel } from './interface/recipe';

const RecipeSchema: Schema = new Schema({
  createdAt: { type: Date, default: Date.now },
  time: { hours: Number, minutes: Number },
  title: { type: String, required: true },
  ingredients: { type: [String], required: true },
  directions: { type: [String], required: true },
})

export const Recipe: Model<IRecipeModel> = model<IRecipeModel>('Recipe', RecipeSchema)
