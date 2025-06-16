import mongoose from 'mongoose';

const JobDescriptionSchema = new mongoose.Schema({
  hrId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  descriptionText: { type: String, required: true },
  publicUrl: String, // We will generate this
  uploadedFileUrl: String, // URL from Vercel Blob
}, { timestamps: { createdAt: true, updatedAt: false } });

JobDescriptionSchema.virtual('id').get(function(){
    return this._id.toHexString();
});
JobDescriptionSchema.set('toJSON', {
    virtuals: true
});

export default mongoose.models.JobDescription || mongoose.model('JobDescription', JobDescriptionSchema);