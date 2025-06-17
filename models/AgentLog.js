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
        'SKILL_MATCHER_V2',
        'SKILL_MATCHER_V3' // The new, high-accuracy matcher
    ] 
    // --- END OF FIX ---
  },
  fileName: String,
  rawInput: { 
    type: String, 
    required: true 
  },
  aiOutput: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
}, { timestamps: { createdAt: true, updatedAt: false } });

AgentLogSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

AgentLogSchema.set('toJSON', {
    virtuals: true
});

export default mongoose.models.AgentLog || mongoose.model('AgentLog', AgentLogSchema);