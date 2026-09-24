import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const recalculateCart = async (cart) => {
  let totalPrice = 0;
  
  // Manually fetch products to avoid mutating the cart document with .populate() before .save()
  const productIds = cart.items.map(item => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  
  cart.items.forEach(item => {
    const pId = item.product._id ? item.product._id.toString() : item.product.toString();
    const product = products.find(p => p._id.toString() === pId);
    if (product) {
      const discountedPrice = product.price * (1 - (product.discount || 0) / 100);
      totalPrice += discountedPrice * item.quantity;
    }
  });
  
  cart.totalPrice = Math.round(totalPrice * 100) / 100;
  return cart;
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
    }

    return res.json({ success: true, cart });
  } catch (error) {
    console.error('Get Cart Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching cart' });
  }
};

// @desc    Add single or multiple products to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  const { productId, quantity, items } = req.body; // Supports bulk add (from AI suggestions) or single add

  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
    }

    // Process bulk items list (AI Cart generation)
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const prod = await Product.findById(item.productId);
        if (!prod) continue;

        const existingIndex = cart.items.findIndex(i => i.product.toString() === item.productId);
        const qty = item.quantity || 1;

        if (existingIndex > -1) {
          cart.items[existingIndex].quantity += qty;
        } else {
          cart.items.push({ product: item.productId, quantity: qty });
        }
      }
    } else if (productId) {
      // Process single item add
      const prod = await Product.findById(productId);
      if (!prod) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const qty = quantity || 1;
      const existingIndex = cart.items.findIndex(item => item.product.toString() === productId);

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += qty;
      } else {
        cart.items.push({ product: productId, quantity: qty });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Please specify products to add' });
    }

    await recalculateCart(cart);
    await cart.save();
    await cart.populate('items.product');

    return res.json({ success: true, message: 'Cart updated successfully', cart });
  } catch (error) {
    console.error('Add to Cart Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error adding to cart' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide productId and quantity' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await recalculateCart(cart);
    await cart.save();
    await cart.populate('items.product');

    return res.json({ success: true, message: 'Cart item updated', cart });
  } catch (error) {
    console.error('Update Cart Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating cart' });
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/remove
// @access  Private
export const removeFromCart = async (req, res) => {
  const { productId } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Please provide productId' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    await recalculateCart(cart);
    await cart.save();
    await cart.populate('items.product');

    return res.json({ success: true, message: 'Product removed from cart', cart });
  } catch (error) {
    console.error('Remove From Cart Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error removing item' });
  }
};
