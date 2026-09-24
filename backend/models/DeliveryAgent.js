import mongoose from 'mongoose';

const deliveryAgentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  isAvailable: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  earnings: { type: Number, default: 0 },
  completedDeliveries: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  ratingsCount: { type: Number, default: 0 },
  activeOrders: { type: Number, default: 0 },
  maximumActiveOrders: { type: Number, default: 3 },
  averageDeliveryTime: { type: Number, default: 25 },
  acceptanceRate: { type: Number, default: 100 },
  rejectionRate: { type: Number, default: 0 },
  totalAccepted: { type: Number, default: 0 },
  totalRejected: { type: Number, default: 0 },
  lastLocationUpdate: { type: Date, default: Date.now },
  activeOrderRequest: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    pickupLocation: { lat: Number, lng: Number },
    deliveryLocation: { lat: Number, lng: Number },
    pickupDistance: { type: Number },
    deliveryDistance: { type: Number },
    totalDistance: { type: Number },
    estimatedEarnings: { type: Number }
  }
}, { timestamps: true });

const DeliveryAgent = mongoose.model('DeliveryAgent', deliveryAgentSchema);
export default DeliveryAgent;
