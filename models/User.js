// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['hr', 'applie'],
    default: null,
  },
  image: String,
  // --- NEW FIELDS for HR Users ---
  geminiApiKey: {
    type: String,
    // It's good practice to encrypt this in a real production app
  },
  schedulingLink: {
    type: String,
    // e.g., https://calendly.com/hr-user
  },
}, { timestamps: true });

UserSchema.virtual('id').get(function(){
    return this._id.toHexString();
});
UserSchema.set('toJSON', {
    virtuals: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);