// models/AgentLog.js
import mongoose from 'mongoose';

const AgentLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  agentType: { 
    type: String, 
    required: true, 
    // --- THIS IS THE FIX ---
    // Add the new versioned agent type to the list of allowed values.
    enum: [
        'RESUME_PARSER', 
        'COVER_LETTER_GENERATOR', 
        'SKILL_MATCHER',
        'SKILL_MATCHER_V2' // The new, high-accuracy matcher
    ] 
    // --- END OF FIX ---
  },
  fileName: String, // Optional: The name of the file being processed
  rawInput: { 
    type: String, 
    required: true 
  }, // The raw text or prompt sent to the AI
  aiOutput: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  }, // The structured JSON or raw text response from the AI
}, { timestamps: { createdAt: true, updatedAt: false } }); // Only track creation time

// Virtual 'id' field
AgentLogSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtuals are included in toJSON outputs
AgentLogSchema.set('toJSON', {
    virtuals: true
});

export default mongoose.models.AgentLog || mongoose.model('AgentLog', AgentLogSchema);