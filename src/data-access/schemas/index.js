import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

export const userSchema = {
  name: 'user',
  def: { username: String, password: String, registeredAt: { type: Date, default: Date.now } },
};

export const todoSchema = {
  name: 'todo',
  def: { title: String, ownerId: { type: ObjectId, ref: 'user' }, due: { type: Date } },
};

export default [userSchema, todoSchema];
