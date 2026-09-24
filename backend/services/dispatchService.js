import DeliveryAgent from '../models/DeliveryAgent.js';
import Order from '../models/Order.js';
import DispatchLog from '../models/DispatchLog.js';
import Store from '../models/Store.js';

let ioInstance = null;

export const setIoInstance = (io) => {
  ioInstance = io;
};

export const getIoInstance = () => {
  return ioInstance;
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the Earth in Km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const requestAgentAssignment = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('store');
    if (!order) return null;

    const customerLat = order.customerLocation?.lat || 12.9780;
    const customerLng = order.customerLocation?.lng || 77.6400;
    const storeLat = order.storeLocation?.lat || (customerLat - 0.012);
    const storeLng = order.storeLocation?.lng || (customerLng - 0.012);

    let availableAgents = await DeliveryAgent.find({ 
      approvalStatus: 'approved',
      isOnline: true
    });

    if (availableAgents.length === 0 && process.env.DEMO_MODE === 'true') {
      const anyApprovedAgent = await DeliveryAgent.findOne({ approvalStatus: 'approved' });
      if (anyApprovedAgent) {
        anyApprovedAgent.isOnline = true;
        anyApprovedAgent.isAvailable = true;
        anyApprovedAgent.currentLocation = { lat: storeLat + 0.005, lng: storeLng + 0.005 };
        await anyApprovedAgent.save();
        availableAgents = [anyApprovedAgent];
      }
    }

    if (availableAgents.length === 0) {
      console.log('No approved agents exist to assign.');
      return null;
    }

    // PART B & C & G: Intelligent Agent Selection, Priority, ETA
    const validAgents = availableAgents.filter(a => a.isAvailable || a.activeOrders < a.maximumActiveOrders);

    const agentsScored = validAgents.map(agent => {
      const distToStore = calculateDistance(agent.currentLocation?.lat || storeLat, agent.currentLocation?.lng || storeLng, storeLat, storeLng);
      // Rough road routing estimate: 20km/h average -> 3 min per km. Real road routing API can be integrated here.
      const etaToStore = Math.max(1, distToStore * 3);
      
      const workloadScore = 1 - (agent.activeOrders / agent.maximumActiveOrders);
      const ratingScore = (agent.rating || 5) / 5;
      const acceptanceRateScore = (agent.acceptanceRate || 100) / 100;

      return { agent, distToStore, etaToStore, workloadScore, ratingScore, acceptanceRateScore };
    });

    const maxDist = Math.max(...agentsScored.map(a => a.distToStore), 1);
    const maxEta = Math.max(...agentsScored.map(a => a.etaToStore), 1);

    const candidateAgents = agentsScored.map(a => {
      const proximityScore = 1 - (a.distToStore / maxDist);
      const etaScore = 1 - (a.etaToStore / maxEta);
      
      let finalScore = (0.45 * proximityScore) + (0.20 * a.workloadScore) + (0.15 * a.ratingScore) + (0.10 * a.acceptanceRateScore) + (0.10 * etaScore);

      // PART C: Priority Boost
      if (order.priority === 'HIGH') finalScore *= 1.1;
      if (order.priority === 'EMERGENCY') finalScore *= 1.3;

      return {
        agent: a.agent._id,
        distance: a.distToStore,
        eta: a.etaToStore,
        rating: a.agent.rating,
        workload: a.agent.activeOrders,
        acceptanceRate: a.agent.acceptanceRate,
        scoreComponents: { proximityScore, workloadScore: a.workloadScore, ratingScore: a.ratingScore, acceptanceScore: a.acceptanceRateScore, etaScore },
        finalScore,
        status: 'Skipped'
      };
    }).sort((a, b) => b.finalScore - a.finalScore);

    // PART F: Create Dispatch Log
    const dispatchLog = await DispatchLog.create({
      order: order._id,
      store: order.store,
      candidateAgents,
      timestamps: { startedAt: new Date() }
    });

    order.pendingAgents = candidateAgents.map(c => ({ agent: c.agent, distToStore: c.distance }));
    order.currentAgentIndex = 0;
    await order.save();

    await tryAssignNextAgent(order._id, dispatchLog._id);
  } catch (error) {
    console.error('Error starting agent assignment:', error.message);
  }
};

export const tryAssignNextAgent = async (orderId, dispatchLogId = null) => {
  const order = await Order.findById(orderId).populate('pendingAgents.agent');
  if (!order || !order.pendingAgents || order.pendingAgents.length === 0) return false;

  if (order.currentAgentIndex >= order.pendingAgents.length) {
    console.log(`All agents rejected or no more agents for order ${orderId}`);
    if (ioInstance) {
      ioInstance.to(order.user.toString()).emit('order-delayed', {
        orderId, message: 'No delivery agents are currently available. We will retry assigning shortly.'
      });
    }
    return false;
  }

  const assignmentInfo = order.pendingAgents[order.currentAgentIndex];
  const agent = assignmentInfo.agent;
  const distToStore = assignmentInfo.distToStore;
  
  order.currentAgentIndex += 1;
  await order.save();

  const pickupDistance = distToStore;
  const deliveryDistance = order.distance || 0;
  const totalDistance = pickupDistance + deliveryDistance;
  const estimatedEarnings = parseFloat((totalDistance * 4 * 0.8).toFixed(2));
  
  let storePrepTime = 15;
  if (order.store) {
    const store = await Store.findById(order.store);
    if (store) storePrepTime = store.preparationTime || 15;
  }
  // PART G: Accurate ETA
  const etaMins = storePrepTime + (totalDistance * 3); // 3 mins per km

  const requestData = {
    orderId: order._id,
    pickupLocation: order.storeLocation,
    deliveryLocation: order.customerLocation,
    pickupDistance: parseFloat(pickupDistance.toFixed(2)),
    deliveryDistance: parseFloat(deliveryDistance.toFixed(2)),
    totalDistance: parseFloat(totalDistance.toFixed(2)),
    estimatedEarnings,
    etaMins: Math.round(etaMins)
  };

  console.log(`Sending assignment request to agent ${agent.name} for Order ${orderId}`);

  if (ioInstance) {
    ioInstance.to(agent.user.toString()).emit('order-assignment-request', requestData);
  }

  agent.activeOrderRequest = requestData;
  await agent.save();

  // PART D: Offer Timeout (and Demo Auto-Accept)
  if (process.env.DEMO_MODE === 'true') {
    console.log(`[DEMO MODE] Auto-accepting order ${orderId} for agent ${agent.name} in 3 seconds...`);
    setTimeout(async () => {
      try {
        const { acceptOrderAssignment } = await import('./dispatchService.js');
        const User = (await import('../models/User.js')).default;
        const fullUser = await User.findById(agent.user);
        if (fullUser) {
          await acceptOrderAssignment(orderId, fullUser);
        }
      } catch (e) {
        console.error('Demo auto-accept failed:', e.message);
      }
    }, 3000);
    return true;
  }

  let timeoutMs = parseInt(process.env.AGENT_OFFER_TIMEOUT_MS) || 15000;
  if (order.priority === 'EMERGENCY') timeoutMs = 10000; // faster timeout for emergency

  setTimeout(async () => {
    try {
      const checkAgent = await DeliveryAgent.findById(agent._id);
      if (checkAgent && checkAgent.activeOrderRequest && checkAgent.activeOrderRequest.orderId.toString() === orderId.toString()) {
        console.log(`Agent ${agent.name} timed out for Order ${orderId}`);
        checkAgent.activeOrderRequest = null;
        checkAgent.totalRejected = (checkAgent.totalRejected || 0) + 1;
        checkAgent.acceptanceRate = Math.round(((checkAgent.totalAccepted || 0) / ((checkAgent.totalAccepted || 0) + checkAgent.totalRejected)) * 100);
        await checkAgent.save();
        
        if (dispatchLogId) {
           await DispatchLog.findOneAndUpdate(
             { _id: dispatchLogId, "candidateAgents.agent": agent._id },
             { $set: { "candidateAgents.$.status": "Timeout", "candidateAgents.$.rejectionReason": "No response" } }
           );
        }

        const checkOrder = await Order.findById(orderId);
        if (checkOrder && !checkOrder.deliveryAgent) {
          await tryAssignNextAgent(orderId, dispatchLogId);
        }
      }
    } catch (e) {
      console.error('Error in agent timeout logic:', e.message);
    }
  }, timeoutMs);

  return true;
};

export const acceptOrderAssignment = async (orderId, agentUser) => {
  const agent = await DeliveryAgent.findOne({ user: agentUser._id });
  if (!agent) throw new Error('Agent profile not found');

  // PART E: Atomic Assignment
  const order = await Order.findOneAndUpdate(
    { _id: orderId, orderStatus: 'Order Confirmed', deliveryAgent: null },
    {
      $set: {
        deliveryAgent: agent._id,
        orderStatus: 'Assigned',
        agentLocation: agent.currentLocation,
        pendingAgents: [],
        currentAgentIndex: 0
      },
      $push: {
        trackingHistory: {
          status: 'Assigned',
          actor: agentUser.name,
          lat: agent.currentLocation.lat,
          lng: agent.currentLocation.lng,
          timestamp: new Date()
        },
        'trackingHistory': {
          status: 'Agent Accepted',
          actor: agentUser.name,
          timestamp: new Date()
        }
      }
    },
    { new: true }
  );

  if (!order) {
    throw new Error('Order is no longer available or already assigned');
  }

  agent.activeOrders = (agent.activeOrders || 0) + 1;
  if (agent.activeOrders >= agent.maximumActiveOrders) {
    agent.isAvailable = false;
  }
  agent.totalAccepted = (agent.totalAccepted || 0) + 1;
  agent.acceptanceRate = Math.round((agent.totalAccepted / (agent.totalAccepted + (agent.totalRejected || 0))) * 100);
  agent.activeOrderRequest = null;
  await agent.save();

  // Log acceptance
  const latestLog = await DispatchLog.findOne({ order: order._id }).sort({ createdAt: -1 });
  if (latestLog) {
    latestLog.selectedAgent = agent._id;
    latestLog.timestamps.completedAt = new Date();
    const candidate = latestLog.candidateAgents.find(c => c.agent.toString() === agent._id.toString());
    if (candidate) candidate.status = 'Selected';
    await latestLog.save();
  }

  console.log(`Agent ${agent.name} accepted Order ${orderId}`);

  if (ioInstance) {
    ioInstance.to(order.user.toString()).emit('order-update', {
      orderId: order._id,
      orderStatus: 'Assigned',
      agent: { name: agent.name, phone: agent.phone, rating: agent.rating, currentLocation: agent.currentLocation }
    });

    ioInstance.to(orderId.toString()).emit('order-track-update', {
      orderId: order._id, orderStatus: 'Assigned', agentLocation: agent.currentLocation, trackingHistory: order.trackingHistory
    });
  }

  if (process.env.DEMO_MODE === 'true') {
    setTimeout(() => { simulateDeliveryFlow(order._id); }, 4000);
  }

  return order;
};

export const rejectOrderAssignment = async (orderId, agentUser) => {
  const agent = await DeliveryAgent.findOne({ user: agentUser._id });
  if (agent) {
    agent.activeOrderRequest = null;
    agent.totalRejected = (agent.totalRejected || 0) + 1;
    agent.acceptanceRate = Math.round(((agent.totalAccepted || 0) / ((agent.totalAccepted || 0) + agent.totalRejected)) * 100);
    await agent.save();

    const latestLog = await DispatchLog.findOne({ order: orderId }).sort({ createdAt: -1 });
    if (latestLog) {
      await DispatchLog.updateOne(
        { _id: latestLog._id, "candidateAgents.agent": agent._id },
        { $set: { "candidateAgents.$.status": "Rejected", "candidateAgents.$.rejectionReason": "Manual Reject" } }
      );
    }
  }

  console.log(`Agent rejected Order ${orderId}. Trying next agent...`);
  
  const latestLog = await DispatchLog.findOne({ order: orderId }).sort({ createdAt: -1 });
  const success = await tryAssignNextAgent(orderId, latestLog ? latestLog._id : null);
  return success;
};

export const simulateDeliveryFlow = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('deliveryAgent');
    if (!order || !order.deliveryAgent) return;

    const agent = order.deliveryAgent;
    const customerLat = order.customerLocation.lat;
    const customerLng = order.customerLocation.lng;
    const storeLat = order.storeLocation.lat;
    const storeLng = order.storeLocation.lng;

    const steps = [
      { status: 'Preparing', lat: storeLat, lng: storeLng },
      { status: 'Picked Up', lat: storeLat, lng: storeLng },
      { status: 'On The Way', lat: (storeLat + customerLat) / 2, lng: (storeLng + customerLng) / 2 },
      { status: 'Near You', lat: customerLat - 0.001, lng: customerLng - 0.001 },
      { status: 'Delivered', lat: customerLat, lng: customerLng }
    ];

    let currentStepIndex = 0;

    const intervalId = setInterval(async () => {
      const currentOrder = await Order.findById(orderId);
      if (!currentOrder || currentOrder.orderStatus === 'Cancelled') {
        clearInterval(intervalId);
        agent.activeOrders = Math.max(0, (agent.activeOrders || 1) - 1);
        agent.isAvailable = agent.activeOrders < agent.maximumActiveOrders;
        await agent.save();
        return;
      }

      if (currentStepIndex >= steps.length) {
        clearInterval(intervalId);
        currentOrder.orderStatus = 'Delivered';
        currentOrder.paymentStatus = currentOrder.paymentMethod === 'COD' ? 'Completed' : currentOrder.paymentStatus;
        currentOrder.agentLocation = { lat: customerLat, lng: customerLng };
        currentOrder.trackingHistory.push({
          status: 'Delivered', actor: agent.name, lat: customerLat, lng: customerLng, timestamp: new Date()
        });
        await currentOrder.save();

        agent.activeOrders = Math.max(0, (agent.activeOrders || 1) - 1);
        agent.isAvailable = agent.activeOrders < agent.maximumActiveOrders;
        agent.currentLocation = { lat: customerLat, lng: customerLng };
        const tripEarnings = parseFloat(((currentOrder.deliveryCharge || 0) * 0.8).toFixed(2));
        agent.earnings = parseFloat(((agent.earnings || 0) + tripEarnings).toFixed(2));
        agent.completedDeliveries = (agent.completedDeliveries || 0) + 1;
        await agent.save();

        if (ioInstance) {
          ioInstance.to(currentOrder.user.toString()).emit('order-update', {
            orderId: currentOrder._id, orderStatus: 'Delivered', paymentStatus: currentOrder.paymentStatus,
            agent: { name: agent.name, phone: agent.phone, currentLocation: agent.currentLocation }
          });
          ioInstance.to(orderId.toString()).emit('order-track-update', {
            orderId: currentOrder._id, orderStatus: 'Delivered', agentLocation: agent.currentLocation, trackingHistory: currentOrder.trackingHistory
          });
        }
        return;
      }

      const step = steps[currentStepIndex];
      currentOrder.orderStatus = step.status;
      currentOrder.agentLocation = { lat: step.lat, lng: step.lng };
      currentOrder.trackingHistory.push({
        status: step.status, actor: agent.name, lat: step.lat, lng: step.lng, timestamp: new Date()
      });
      await currentOrder.save();

      agent.currentLocation = { lat: step.lat, lng: step.lng };
      agent.lastLocationUpdate = new Date();
      await agent.save();

      if (ioInstance) {
        ioInstance.to(currentOrder.user.toString()).emit('order-update', {
          orderId: currentOrder._id, orderStatus: step.status, agent: { name: agent.name, phone: agent.phone, rating: agent.rating, currentLocation: agent.currentLocation }
        });
        ioInstance.to(orderId.toString()).emit('order-track-update', {
          orderId: currentOrder._id, orderStatus: step.status, agentLocation: agent.currentLocation, trackingHistory: currentOrder.trackingHistory
        });
      }

      currentStepIndex++;
    }, 6000); 

  } catch (error) {
    console.error('Error during delivery simulation:', error.message);
  }
};

export const assignNearestAgent = async (orderId) => {
  return requestAgentAssignment(orderId);
};
