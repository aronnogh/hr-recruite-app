// models/Application.js
import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  jdId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription', required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  applieId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // --- THIS IS THE NEW, FLATTENED SCHEMA ---
  matchScore: { type: Number, default: 0 },
  feedbackForCandidate: { type: String, default: '' },
  matchedSkills: { type: [String], default: [] }, // An array of strings
  missingSkills: { type: [String], default: [] }, // An array of strings
  // The 'aiAnalysis' object is now removed.
  
  generatedCoverLetter: String,
  status: {
    type: String,
    enum: ['submitted', 'in-review', 'shortlisted', 'rejected', 'interview-scheduled'],
    default: 'submitted'
  },
  submittedAt: { type: Date, default: Date.now },
});

ApplicationSchema.virtual('id').get(function(){ return this._id.toHexString(); });
ApplicationSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);