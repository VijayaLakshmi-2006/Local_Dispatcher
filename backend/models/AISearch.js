import mongoose from 'mongoose';

const aiSearchSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: String, required: true },
  aiResponse: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

const AISearch = mongoose.model('AISearch', aiSearchSchema);
export default AISearch;
