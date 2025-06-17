// models/Application.js
import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  jdId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription', required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  applieId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchScore: Number,
  matchedSkills: [String],
  generatedCoverLetter: String,
  status: {
    type: String,
    // --- THIS IS THE FIX ---
    // Add 'interview-scheduled' to the list of allowed values.
    enum: ['submitted', 'in-review', 'shortlisted', 'rejected', 'interview-scheduled'],
    // --- END OF FIX ---
    default: 'submitted'
  },
  submittedAt: { type: Date, default: Date.now },
});

ApplicationSchema.virtual('id').get(function(){ return this._id.toHexString(); });
ApplicationSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);