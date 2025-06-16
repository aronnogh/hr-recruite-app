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
}, { timestamps: true });

UserSchema.virtual('id').get(function(){
    return this._id.toHexString();
});
UserSchema.set('toJSON', {
    virtuals: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);