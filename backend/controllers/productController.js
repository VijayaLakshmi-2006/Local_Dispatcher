import Product from '../models/Product.js';

// @desc    Get all products (with category filter and search)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  const { category, search } = req.query;

  try {
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query);
    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Get Products Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, product });
  } catch (error) {
    console.error('Get Product By ID Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching product' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const { name, description, category, price, discount, stock, image, brand, unit } = req.body;

  try {
    const product = await Product.create({
      name,
      description,
      category,
      price,
      discount: discount || 0,
      stock,
      image: image || '',
      brand: brand || 'Generic',
      unit: unit || 'unit'
    });

    return res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    console.error('Create Product Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error creating product' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update Product Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error updating product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete Product Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
};
