import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import DeliveryAgent from '../models/DeliveryAgent.js';
import Store from '../models/Store.js';
import DispatchLog from '../models/DispatchLog.js';
import { assignNearestAgent, calculateDistance } from '../services/dispatchService.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Create a new order from cart
// @route   POST /api/orders/create
// @access  Private
export const createOrder = async (req, res) => {
  const { address, paymentMethod, priority = 'NORMAL' } = req.body;

  let reservedProducts = [];
  let selectedStore = null;

  try {
    if (!address || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Please provide address and payment method' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Get customer location
    const customerLat = req.user.location && req.user.location.latitude ? req.user.location.latitude : 12.9780;
    const customerLng = req.user.location && req.user.location.longitude ? req.user.location.longitude : 77.6400;

    // PART A: Store Selection Algorithm
    // Find all active & open stores
    const allStores = await Store.find({ isActive: true, isOpen: true });
    
    let feasibleStores = [];

    // For each store, verify if they have sufficient stock for ALL cart items
    for (const store of allStores) {
      let canFulfill = true;
      let totalStockSurplus = 0;
      let storeCartPrice = 0;

      for (const item of cart.items) {
        if (!item.product) continue;
        const p = await Product.findById(item.product._id);
        if (!p) { canFulfill = false; break; }

        const inventory = p.storeInventory.find(inv => inv.store.toString() === store._id.toString() && inv.isAvailable);
        
        if (!inventory || inventory.stock < item.quantity) {
          canFulfill = false;
          break;
        }

        totalStockSurplus += (inventory.stock - item.quantity);
        const effectivePrice = inventory.price || p.price;
        storeCartPrice += (effectivePrice * (1 - (p.discount || 0) / 100)) * item.quantity;
      }

      if (canFulfill) {
        const dist = calculateDistance(store.location.lat, store.location.lng, customerLat, customerLng);
        feasibleStores.push({
          store,
          distance: dist,
          prepTime: store.preparationTime || 15,
          stockSurplus: totalStockSurplus,
          cartPrice: storeCartPrice
        });
      }
    }

    if (feasibleStores.length === 0) {
      return res.status(400).json({ success: false, message: 'No nearby store can currently fulfill your entire order.' });
    }

    // Calculate Store Score
    // Normalize factors. Distance: lower is better (max 20km). PrepTime: lower is better (max 60m). Stock: higher is better
    const maxDist = Math.max(...feasibleStores.map(s => s.distance), 1);
    const maxPrep = Math.max(...feasibleStores.map(s => s.prepTime), 1);
    const maxStock = Math.max(...feasibleStores.map(s => s.stockSurplus), 1);

    feasibleStores.forEach(s => {
      const normProximity = 1 - (s.distance / maxDist);
      const normPrepTime = 1 - (s.prepTime / maxPrep);
      const normStock = s.stockSurplus / maxStock;

      // Weighted Hyperlocal Store Selection Algorithm
      s.score = (0.45 * normProximity) + (0.30 * normStock) + (0.25 * normPrepTime);
    });

    // Sort descending by score
    feasibleStores.sort((a, b) => b.score - a.score);
    const bestStoreMatch = feasibleStores[0];
    selectedStore = bestStoreMatch.store;

    // Now deduct stock from the selected store atomically
    const orderProducts = [];
    
    try {
      for (const item of cart.items) {
        if (!item.product) continue;
        
        // Atomically decrement stock in storeInventory
        const updatedProduct = await Product.findOneAndUpdate(
          { 
            _id: item.product._id, 
            'storeInventory.store': selectedStore._id,
            'storeInventory.stock': { $gte: item.quantity }
          },
          { $inc: { 'storeInventory.$.stock': -item.quantity } },
          { new: true }
        );
        
        if (!updatedProduct) {
          throw new Error(`Concurrency stock issue for ${item.product.name} at store ${selectedStore.name}`);
        }
        
        reservedProducts.push({ productId: updatedProduct._id, storeId: selectedStore._id, qty: item.quantity });
        
        const inventory = updatedProduct.storeInventory.find(inv => inv.store.toString() === selectedStore._id.toString());
        const effectivePrice = inventory.price || updatedProduct.price;
        const discountedPrice = effectivePrice * (1 - (updatedProduct.discount || 0) / 100);

        orderProducts.push({
          product: updatedProduct._id,
          name: updatedProduct.name,
          price: discountedPrice,
          quantity: item.quantity
        });
      }
    } catch (err) {
      // Rollback
      for (const reserved of reservedProducts) {
        await Product.findOneAndUpdate(
          { _id: reserved.productId, 'storeInventory.store': reserved.storeId },
          { $inc: { 'storeInventory.$.stock': reserved.qty } }
        );
      }
      return res.status(400).json({ success: false, message: 'Stock became unavailable during checkout. Please try again.' });
    }

    const storeLat = selectedStore.location.lat;
    const storeLng = selectedStore.location.lng;
    const distance = bestStoreMatch.distance;
    
    const deliveryCharge = parseFloat((distance * 4).toFixed(2));
    const finalTotalPrice = parseFloat((bestStoreMatch.cartPrice + deliveryCharge).toFixed(2));

    const simulatedPaymentId = paymentMethod !== 'COD' ? `pay_${uuidv4().replace(/-/g, '').slice(0, 16)}` : null;
    const paymentStatus = paymentMethod !== 'COD' ? 'Completed' : 'Pending';

    // Ensure valid priority
    const validPriority = ['NORMAL', 'HIGH', 'EMERGENCY'].includes(priority) ? priority : 'NORMAL';

    const order = await Order.create({
      user: req.user._id,
      store: selectedStore._id,
      products: orderProducts,
      totalPrice: finalTotalPrice,
      priority: validPriority,
      address,
      paymentMethod,
      paymentStatus,
      paymentId: simulatedPaymentId,
      orderStatus: 'Order Confirmed',
      storeLocation: { lat: storeLat, lng: storeLng },
      customerLocation: { lat: customerLat, lng: customerLng },
      distance: parseFloat(distance.toFixed(2)),
      deliveryCharge,
      trackingHistory: [
        {
          status: 'Order Confirmed',
          lat: storeLat,
          lng: storeLng,
          timestamp: new Date()
        },
        {
          status: 'Store Selected',
          lat: storeLat,
          lng: storeLng,
          timestamp: new Date()
        }
      ]
    });

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    console.log(`Order created successfully: ${order._id}, Store: ${selectedStore.name}, Priority: ${validPriority}`);

    assignNearestAgent(order._id);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully and is being dispatched',
      order
    });
  } catch (error) {
    console.error('Create Order Error:', error.message);
    for (const reserved of reservedProducts) {
      try {
        await Product.findOneAndUpdate(
          { _id: reserved.productId, 'storeInventory.store': reserved.storeId },
          { $inc: { 'storeInventory.$.stock': reserved.qty } }
        );
      } catch (rollbackError) {
        console.error('Failed to rollback stock', rollbackError.message);
      }
    }
    return res.status(500).json({ success: false, message: 'Server error placing order' });
  }
};

// @desc    Get user orders (Scoped by role)
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    let orders = [];

    if (req.user.role === 'admin') {
      // Admin gets all orders
      orders = await Order.find({}).populate('user', 'name email').populate('store').populate('deliveryAgent').sort({ createdAt: -1 });
    } else if (req.user.role === 'delivery_agent') {
      // Find the agent record first
      const agent = await DeliveryAgent.findOne({ user: req.user._id });
      if (agent) {
        orders = await Order.find({ deliveryAgent: agent._id }).populate('user', 'name email phone').sort({ createdAt: -1 });
      }
    } else {
      // Customer gets their own orders
      orders = await Order.find({ user: req.user._id }).populate('store').populate('deliveryAgent').sort({ createdAt: -1 });
    }

    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Get Orders Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('store')
      .populate('deliveryAgent');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization: only the order placing customer, assigned agent, or admin can read it
    const isCustomer = order.user._id.toString() === req.user._id.toString();
    const isAdminUser = req.user.role === 'admin';
    
    let isAssignedAgent = false;
    if (req.user.role === 'delivery_agent' && order.deliveryAgent) {
      const agent = await DeliveryAgent.findOne({ user: req.user._id });
      if (agent && order.deliveryAgent._id.toString() === agent._id.toString()) {
        isAssignedAgent = true;
      }
    }

    if (!isCustomer && !isAdminUser && !isAssignedAgent) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    console.error('Get Order ID Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching order details' });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findById(orderId).populate('deliveryAgent');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization check
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    // Check if order can be cancelled (Only in early stages)
    const nonCancellable = ['Picked Up', 'On The Way', 'Near You', 'Delivered', 'Cancelled'];
    if (nonCancellable.includes(order.orderStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be cancelled in status: ${order.orderStatus}` 
      });
    }

    // Refund inventory stock
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Release delivery agent if assigned
    if (order.deliveryAgent) {
      const agent = await DeliveryAgent.findById(order.deliveryAgent._id);
      if (agent) {
        agent.isAvailable = true;
        await agent.save();
      }
    }

    order.orderStatus = 'Cancelled';
    order.paymentStatus = order.paymentStatus === 'Completed' ? 'Refunded' : order.paymentStatus;
    await order.save();

    console.log(`Order cancelled successfully: ${orderId}`);

    return res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel Order Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error cancelling order' });
  }
};

// @desc    Rate an order/agent
// @route   POST /api/orders/:id/rate
// @access  Private
export const rateOrder = async (req, res) => {
  const { agentRating, agentReview, experienceRating } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to rate this order' });
    }

    order.ratings = {
      agentRating,
      agentReview,
      experienceRating
    };
    await order.save();

    // If rated agent, update agent cumulative rating
    if (order.deliveryAgent && agentRating) {
      const agent = await DeliveryAgent.findById(order.deliveryAgent);
      if (agent) {
        const currentCount = agent.ratingsCount || 0;
        const currentRating = agent.rating || 5.0;
        
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + agentRating) / newCount;

        agent.ratingsCount = newCount;
        agent.rating = Math.round(newRating * 10) / 10;
        await agent.save();
      }
    }

    return res.json({ success: true, message: 'Ratings saved successfully', order });
  } catch (error) {
    console.error('Rate Order Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error rating order' });
  }
};

// @desc    Get dispatch log for an order
// @route   GET /api/orders/:id/dispatch-log
// @access  Private (Admin only)
export const getDispatchLog = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const log = await DispatchLog.findOne({ order: req.params.id })
      .populate('candidateAgents.agent', 'name email phone rating completedDeliveries')
      .populate('selectedAgent', 'name email phone rating');

    if (!log) {
      return res.status(404).json({ success: false, message: 'Dispatch log not found for this order' });
    }

    return res.json({ success: true, log });
  } catch (error) {
    console.error('Get Dispatch Log Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching dispatch log' });
  }
};
