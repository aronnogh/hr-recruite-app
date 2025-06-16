// models/FileMeta.js
import mongoose from 'mongoose';

const FileMetaSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  fileType: { 
    type: String, 
    required: true,
    // e.g., 'application/pdf', 'text/plain'
  },
  // A flag to quickly identify if this file was used in an AI agent process
  usedInAgent: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: { createdAt: 'uploadedAt', updatedAt: false } }); // Use 'uploadedAt' for the creation timestamp

// Virtual 'id' field
FileMetaSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtuals are included in toJSON outputs
FileMetaSchema.set('toJSON', {
    virtuals: true
});

export default mongoose.models.FileMeta || mongoose.model('FileMeta', FileMetaSchema);