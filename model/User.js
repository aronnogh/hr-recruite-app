import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: {
    type: String,
    enum: ['hr', 'applie'],
    default: 'applie',
  },
  roleLocked: { type: Boolean, default: false }, // To lock role after first selection
}, { timestamps: true });

const User = models.User || model('User', UserSchema);
export default User;