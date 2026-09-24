import DeliveryAgent from '../models/DeliveryAgent.js';
import Order from '../models/Order.js';
import { assignNearestAgent, simulateDeliveryFlow, getIoInstance } from '../services/dispatchService.js';

// @desc    Get tracking info for an order (location of agent, status, ETA)
// @route   GET /api/dispatch/track/:orderId
// @access  Private
export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .select('orderStatus address paymentStatus user deliveryAgent')
      .populate({
        path: 'deliveryAgent',
        select: 'name phone currentLocation rating'
      });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check auth (User who placed order or Admin or Assigned Agent)
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    let isAgent = false;
    if (req.user.role === 'delivery_agent' && order.deliveryAgent) {
      const agent = await DeliveryAgent.findOne({ user: req.user._id });
      if (agent && order.deliveryAgent._id.toString() === agent._id.toString()) {
        isAgent = true;
      }
    }

    if (!isOwner && !isAdmin && !isAgent) {
      return res.status(403).json({ success: false, message: 'Not authorized to track this order' });
    }

    // Predict ETA (Simple rule: 2 mins preparation + 3 mins travel time simulation, scaled down for demo)
    // Distance from central store (hub) to Indiranagar (seeded customer location) is approx 5km.
    // At simulated speed, ETA is dynamic based on status:
    let eta = '15 mins';
    if (order.orderStatus === 'Preparing') eta = '12 mins';
    if (order.orderStatus === 'Assigned') eta = '10 mins';
    if (order.orderStatus === 'Picked Up') eta = '7 mins';
    if (order.orderStatus === 'On The Way') eta = '4 mins';
    if (order.orderStatus === 'Near You') eta = '1 min';
    if (order.orderStatus === 'Delivered') eta = 'Arrived';

    return res.json({
      success: true,
      orderStatus: order.orderStatus,
      eta,
      deliveryAgent: order.deliveryAgent,
      address: order.address
    });
  } catch (error) {
    console.error('Track Order Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving tracking information' });
  }
};

// @desc    Update delivery agent location (Agent manual update / simulation update)
// @route   PUT /api/dispatch/update-location
// @access  Private/Agent
export const updateAgentLocation = async (req, res) => {
  const { lat, lng, isAvailable, status, orderId } = req.body;

  try {
    const agent = await DeliveryAgent.findOne({ user: req.user._id });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Delivery Agent profile not found' });
    }

    if (lat !== undefined && lng !== undefined) {
      agent.currentLocation = { lat, lng };
    }

    if (isAvailable !== undefined) {
      agent.isAvailable = isAvailable;
    }

    await agent.save();

    // Support manual status simulations from the rider console
    if (orderId && status) {
      const order = await Order.findById(orderId);
      if (order) {
        // Agent security check
        if (order.deliveryAgent && order.deliveryAgent.toString() !== agent._id.toString() && req.user.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'You are not assigned to this order' });
        }

        // Validate status transition
        const validTransitions = {
          'Order Confirmed': ['Preparing', 'Assigned', 'Cancelled'],
          'Preparing': ['Assigned', 'Cancelled'],
          'Assigned': ['Picked Up', 'Cancelled'],
          'Picked Up': ['On The Way'],
          'On The Way': ['Near You'],
          'Near You': ['Delivered'],
          'Delivered': [],
          'Cancelled': []
        };

        if (!validTransitions[order.orderStatus] || !validTransitions[order.orderStatus].includes(status)) {
          return res.status(400).json({ success: false, message: `Invalid status transition from ${order.orderStatus} to ${status}` });
        }

        order.orderStatus = status;
        if (lat !== undefined && lng !== undefined) {
          order.agentLocation = { lat, lng };
        }
        order.trackingHistory.push({
          status,
          lat: lat !== undefined ? lat : (order.storeLocation?.lat || 12.9724),
          lng: lng !== undefined ? lng : (order.storeLocation?.lng || 77.5951),
          timestamp: new Date()
        });

        if (status === 'Delivered') {
          order.paymentStatus = order.paymentMethod === 'COD' ? 'Completed' : order.paymentStatus;
          agent.isAvailable = true;
          const tripEarnings = parseFloat(((order.deliveryCharge || 0) * 0.8).toFixed(2));
          agent.earnings = parseFloat(((agent.earnings || 0) + tripEarnings).toFixed(2));
          agent.completedDeliveries = (agent.completedDeliveries || 0) + 1;
          await agent.save();
        }

        await order.save();

        const io = getIoInstance();
        if (io) {
          io.to(order.user.toString()).emit('order-update', {
            orderId: order._id,
            orderStatus: status,
            paymentStatus: order.paymentStatus,
            agent: {
              name: agent.name,
              phone: agent.phone,
              rating: agent.rating,
              currentLocation: agent.currentLocation
            }
          });

          io.to(orderId.toString()).emit('order-track-update', {
            orderId: order._id,
            orderStatus: status,
            agentLocation: agent.currentLocation,
            trackingHistory: order.trackingHistory
          });
        }
      }
    }

    return res.json({
      success: true,
      message: 'Agent status and location updated successfully',
      agent
    });
  } catch (error) {
    console.error('Update Location Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating location' });
  }
};

// @desc    Manual or Force Assign Agent (Admin function)
// @route   POST /api/dispatch/assign
// @access  Private/Admin
export const manualAssignAgent = async (req, res) => {
  const { orderId, agentId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (agentId) {
      // Manual specific assignment
      const agent = await DeliveryAgent.findById(agentId);
      if (!agent) {
        return res.status(404).json({ success: false, message: 'Delivery Agent not found' });
      }

      // If already assigned to someone else, release the previous agent
      if (order.deliveryAgent) {
        const prevAgent = await DeliveryAgent.findById(order.deliveryAgent);
        if (prevAgent) {
          prevAgent.isAvailable = true;
          await prevAgent.save();
        }
      }

      order.deliveryAgent = agent._id;
      order.orderStatus = 'Assigned';
      await order.save();

      agent.isAvailable = false;
      await agent.save();

      // Start the transit simulation
      setTimeout(() => {
        simulateDeliveryFlow(order._id);
      }, 3000);

      return res.json({ success: true, message: `Successfully assigned agent ${agent.name} manually`, order });
    } else {
      // Trigger auto-allocation algorithm (Nearest)
      const assigned = await assignNearestAgent(orderId);
      if (!assigned) {
        return res.status(400).json({ success: false, message: 'No available delivery agents found nearby' });
      }
      return res.json({ success: true, message: `Auto-assigned nearest agent: ${assigned.name}`, order });
    }
  } catch (error) {
    console.error('Manual Assign Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during agent assignment' });
  }
};

// @desc    Get list of all delivery agents (Admin function)
// @route   GET /api/dispatch/agents
// @access  Private/Admin
export const getAllAgents = async (req, res) => {
  try {
    const agents = await DeliveryAgent.find({});
    return res.json({ success: true, count: agents.length, agents });
  } catch (error) {
    console.error('Get All Agents Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving agents' });
  }
};

// @desc    Toggle delivery agent online/offline status
// @route   PUT /api/dispatch/toggle-online
// @access  Private/Agent
export const toggleAgentOnline = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findOne({ user: req.user._id });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Delivery Agent profile not found' });
    }

    agent.isOnline = !agent.isOnline;
    agent.isAvailable = agent.isOnline;
    if (!agent.isOnline) {
      agent.activeOrderRequest = null;
    }

    await agent.save();

    return res.json({
      success: true,
      message: `Agent is now ${agent.isOnline ? 'Online' : 'Offline'}`,
      agent
    });
  } catch (error) {
    console.error('Toggle Online Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error toggling status' });
  }
};

// @desc    Get delivery agent profile
// @route   GET /api/dispatch/agent-profile
// @access  Private/Agent
export const getAgentProfile = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findOne({ user: req.user._id });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Delivery Agent profile not found' });
    }
    return res.json({ success: true, agent });
  } catch (error) {
    console.error('Get Agent Profile Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving agent profile' });
  }
};

// @desc    Agent accepts order assignment request
// @route   POST /api/dispatch/accept
// @access  Private/Agent
export const acceptOrder = async (req, res) => {
  const { orderId } = req.body;
  try {
    const { acceptOrderAssignment } = await import('../services/dispatchService.js');
    const order = await acceptOrderAssignment(orderId, req.user);
    return res.json({ success: true, message: 'Order accepted successfully', order });
  } catch (error) {
    console.error('Accept Order Error:', error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Agent rejects order assignment request
// @route   POST /api/dispatch/reject
// @access  Private/Agent
export const rejectOrder = async (req, res) => {
  const { orderId } = req.body;
  try {
    const { rejectOrderAssignment } = await import('../services/dispatchService.js');
    const success = await rejectOrderAssignment(orderId, req.user);
    return res.json({ success: true, message: 'Order rejected successfully', nextAgentAssigned: success });
  } catch (error) {
    console.error('Reject Order Error:', error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get agent active request
// @route   GET /api/dispatch/active-request
// @access  Private/Agent
export const getActiveRequest = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findOne({ user: req.user._id });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent profile not found' });
    }
    return res.json({ success: true, activeRequest: agent.activeOrderRequest });
  } catch (error) {
    console.error('Get Active Request Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving active request' });
  }
};
