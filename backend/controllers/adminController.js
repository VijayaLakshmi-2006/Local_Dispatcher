import User from '../models/User.js';
import DeliveryAgent from '../models/DeliveryAgent.js';
import Order from '../models/Order.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Get All Users Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
};

// @desc    Update user status / activation
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  const { status, isActive } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (status !== undefined) {
      user.status = status;
      if (status === 'suspended' || status === 'deactivated') {
        user.isActive = false;
      } else if (status === 'active') {
        user.isActive = true;
      }
    }
    if (isActive !== undefined) {
      user.isActive = isActive;
      if (!isActive && user.status === 'active') {
        user.status = 'deactivated';
      } else if (isActive && user.status !== 'active') {
        user.status = 'active';
      }
    }

    await user.save();
    return res.json({ success: true, message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Update User Status Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating user status' });
  }
};

// @desc    Update delivery agent status (approval, active)
// @route   PUT /api/admin/agents/:id/status
// @access  Private/Admin
export const updateAgentStatus = async (req, res) => {
  const { approvalStatus, isActive, isAvailable } = req.body;
  try {
    const agent = await DeliveryAgent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Delivery Agent not found' });
    }

    if (approvalStatus !== undefined) {
      agent.approvalStatus = approvalStatus;
      if (approvalStatus === 'approved') {
        agent.isAvailable = true;
      } else {
        agent.isAvailable = false;
        agent.isOnline = false;
      }
    }

    if (isAvailable !== undefined) {
      agent.isAvailable = isAvailable;
    }

    await agent.save();

    // Also update corresponding User status if isActive is passed
    if (isActive !== undefined) {
      const user = await User.findById(agent.user);
      if (user) {
        user.isActive = isActive;
        user.status = isActive ? 'active' : 'deactivated';
        await user.save();
      }
    }

    return res.json({ success: true, message: 'Agent status updated successfully', agent });
  } catch (error) {
    console.error('Update Agent Status Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating agent status' });
  }
};

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAdminAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    
    const activeOrders = await Order.countDocuments({
      orderStatus: { $in: ['Order Confirmed', 'Preparing', 'Assigned', 'Picked Up', 'On The Way', 'Near You'] }
    });

    const completedOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    // Aggregate revenues and delivery charges
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, totalDeliveryCharge: { $sum: '$deliveryCharge' } } }
    ]);

    const revenue = revenueResult[0] ? revenueResult[0].totalRevenue : 0;
    const deliveryCharges = revenueResult[0] ? revenueResult[0].totalDeliveryCharge : 0;

    // Aggregate agent earnings
    const agentEarningsResult = await DeliveryAgent.aggregate([
      { $group: { _id: null, totalEarnings: { $sum: '$earnings' } } }
    ]);
    const agentEarnings = agentEarningsResult[0] ? agentEarningsResult[0].totalEarnings : 0;

    return res.json({
      success: true,
      analytics: {
        totalOrders,
        activeOrders,
        completedOrders,
        revenue,
        deliveryCharges,
        agentEarnings
      }
    });
  } catch (error) {
    console.error('Get Analytics Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving analytics' });
  }
};
