import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  applieId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  parsedText: String,
  analysisResult: mongoose.Schema.Types.Mixed,
}, { timestamps: { createdAt: true, updatedAt: false } });

ResumeSchema.virtual('id').get(function(){ return this._id.toHexString(); });
ResumeSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);