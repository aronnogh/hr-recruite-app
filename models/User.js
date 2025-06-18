// models/User.js
import mongoose from 'mongoose';

// A list of currently supported and recommended models
const SUPPORTED_GEMINI_MODELS = [
    'gemini-1.5-pro-latest', // Best for complex reasoning & multimodal (PDFs)
    'gemini-1.5-flash-latest', // Faster, cheaper, great for text tasks
    'gemini-pro', // Older but reliable text-only model
];


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
  // --- Fields for HR Users ---
  geminiApiKey: {
    type: String,
  },
  schedulingLink: {
    type: String,
  },
  companyName: {
    type: String,
    default: 'My Company',
  },
  // --- NEW FIELD ---
  geminiModel: {
    type: String,
    enum: SUPPORTED_GEMINI_MODELS,
    default: 'gemini-1.5-flash-latest', // A sensible, cost-effective default
  },
}, { timestamps: true });

UserSchema.virtual('id').get(function(){
    return this._id.toHexString();
});
UserSchema.set('toJSON', {
    virtuals: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);