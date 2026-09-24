import mongoose from 'mongoose';

const dispatchLogSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  candidateAgents: [{
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAgent' },
    distance: Number,
    eta: Number,
    rating: Number,
    workload: Number,
    acceptanceRate: Number,
    scoreComponents: {
      proximityScore: Number,
      workloadScore: Number,
      ratingScore: Number,
      acceptanceScore: Number,
      etaScore: Number
    },
    finalScore: Number,
    status: { type: String, enum: ['Selected', 'Rejected', 'Timeout', 'Skipped'], default: 'Skipped' },
    rejectionReason: String,
    timestamp: { type: Date, default: Date.now }
  }],
  selectedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAgent' },
  timestamps: {
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
  }
}, { timestamps: true });

const DispatchLog = mongoose.model('DispatchLog', dispatchLogSchema);
export default DispatchLog;
