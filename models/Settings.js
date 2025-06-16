// models/Settings.js
import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true // Each user should have only one settings document
  },
  coverLetterTone: { 
    type: String, 
    enum: ['professional', 'enthusiastic', 'formal', 'casual'], 
    default: 'professional'
  },
  summaryLength: {
    type: Number,
    default: 150, // e.g., default summary length in words
  },
}, { timestamps: { createdAt: false, updatedAt: true } }); // Only track when settings were last updated

// Virtual 'id' field
SettingsSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtuals are included in toJSON outputs
SettingsSchema.set('toJSON', {
    virtuals: true
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);