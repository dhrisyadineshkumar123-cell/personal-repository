const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

/* MongoDB Connection */
mongoose.connect("mongodb://127.0.0.1:27017/smartstock")
  .then(async () => {
    console.log("✅ MongoDB Connected");
    await seedData();
  })
  .catch(err => console.log(err));

/* Schema */
const productSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: String,
  quantity: { type: Number, default: 0 },
  price: { type: Number, required: true },
  category: { type: String, default: 'Uncategorized' },
  stock: { 
    type: String, 
    enum: ['optimal', 'low', 'critical', 'overstock'], 
    default: 'optimal' 
  }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

/* Auth Middleware */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const role = authHeader.slice(7);
  if (role !== 'admin' && role !== 'staff') {
    return res.status(401).json({ error: 'Invalid role' });
  }
  req.role = role;
  next();
};

/* Routes - /products */

app.get('/products', authMiddleware, async (req, res) => {
  try {
    const data = await Product.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/products', authMiddleware, async (req, res) => {
  try {
    const { id, ...productData } = req.body;
    const newId = id || 'PRD-' + Date.now().toString().slice(-6);
    const newProduct = new Product({ ...productData, id: newId });
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/products/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/products/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/products/:id/flow', authMiddleware, async (req, res) => {
  try {
    const history = await StockHistory.find({ productId: req.params.id }).sort({ timestamp: -1 }).limit(50);
    const flows = history.map(h => ({
      type: h.type,
      quantity: h.quantity,
      date: h.timestamp.toISOString()
    }));
    res.json(flows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Category Schema */
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

/* Sales Schema */
const salesSchema = new mongoose.Schema({
  salesId: { type: String, unique: true, required: true },
  productId: { type: String, required: true },
  productName: { type: String, default: '' },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  role: { type: String, required: true }
}, { timestamps: true });

const Sale = mongoose.model("Sale", salesSchema);

/* Stock History Schema */
const stockHistorySchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: String,
  type: { type: String, enum: ['inflow', 'outflow'], required: true },
  quantity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const StockHistory = mongoose.model("StockHistory", stockHistorySchema);

/* Seed function */
const seedData = async () => {
  try {
    // Seed categories
    const categories = await Category.find({});
    if (categories.length === 0) {
      await Promise.all([
        new Category({ name: 'Beverages', description: 'Drinks and liquids' }).save(),
        new Category({ name: 'Dairy', description: 'Milk products' }).save(),
        new Category({ name: 'Produce', description: 'Fruits and vegetables' }).save(),
        new Category({ name: 'Bakery', description: 'Bread and pastries' }).save(),
        new Category({ name: 'Electronics', description: 'Gadgets' }).save()
      ]);
      console.log('✅ Categories seeded');
    }

    // Seed products
    const products = await Product.find({});
    if (products.length === 0) {
      await Promise.all([
        new Product({
          id: 'PRD001',
          name: 'Coffee Beans',
          description: 'Premium arabica',
          quantity: 150,
          price: 12.99,
          category: 'Beverages',
          stock: 'optimal'
        }).save(),
        new Product({
          id: 'PRD002',
          name: 'Whole Milk',
          description: '1L organic',
          quantity: 25,
          price: 3.49,
          category: 'Dairy',
          stock: 'low'
        }).save(),
        new Product({
          id: 'PRD003',
          name: 'Apples',
          description: 'Organic gala',
          quantity: 80,
          price: 1.99,
          category: 'Produce',
          stock: 'optimal'
        }).save(),
        new Product({
          id: 'PRD004',
          name: 'Sliced Bread',
          description: 'Whole wheat loaf',
          quantity: 200,
          price: 2.29,
          category: 'Bakery',
          stock: 'overstock'
        }).save(),
        new Product({
          id: 'PRD005',
          name: 'Smartphone',
          description: 'Latest model',
          quantity: 5,
          price: 599.99,
          category: 'Electronics',
          stock: 'critical'
        }).save(),
        new Product({
          id: 'PRD006',
          name: 'Orange Juice',
          description: 'Fresh squeezed 1L',
          quantity: 35,
          price: 4.99,
          category: 'Beverages',
          stock: 'low'
        }).save()
      ]);
      console.log('✅ Products seeded');
    }
  } catch (err) {
    console.log('Seed error:', err.message);
  }
};

/* Categories routes - admin only */
const adminMiddleware = (req, res, next) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};

app.get('/categories', authMiddleware, async (req, res) => {
  try {
    const data = await Category.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/categories', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const newCat = new Category(req.body);
    const saved = await newCat.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/categories/:name', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Category.findOneAndUpdate(
      { name: req.params.name },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/categories/:name', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Category.findOneAndDelete({ name: req.params.name });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Sales routes - available at both /sales and /api/sales */
const handleGetSales = async (req, res) => {
  try {
    const { from, to } = req.query;
    let filter = {};
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = toDate;
      }
    }
    const data = await Sale.find(filter).sort({ timestamp: -1 }).limit(200);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handlePostSale = async (req, res) => {
  try {
    const { productId, quantity, unitPrice } = req.body;

    if (!productId || !quantity || !unitPrice) {
      return res.status(400).json({ error: 'productId, quantity, and unitPrice are required' });
    }

    const qty = Number(quantity);
    const price = Number(unitPrice);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'quantity must be a positive number' });
    }
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'unitPrice must be a positive number' });
    }

    // Check stock BEFORE saving the sale
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ error: `Product '${productId}' not found` });
    }
    if (product.quantity < qty) {
      return res.status(400).json({ error: `Insufficient stock. Available: ${product.quantity}, requested: ${qty}` });
    }

    // Now save the sale
    const totalAmount = qty * price;
    const salesId = 'SALE-' + Date.now().toString().slice(-8);
    const sale = new Sale({
      ...req.body,
      salesId,
      quantity: qty,
      unitPrice: price,
      totalAmount,
      role: req.role
    });
    await sale.save();

    // Reduce product stock
    product.quantity -= qty;
    // Auto-update stock status based on new quantity
    if (product.quantity === 0) product.stock = 'critical';
    else if (product.quantity <= 10) product.stock = 'critical';
    else if (product.quantity <= 30) product.stock = 'low';
    else product.stock = 'optimal';
    await product.save();

    // Record history
    await new StockHistory({
      productId: product.id,
      productName: product.name,
      type: 'outflow',
      quantity: qty
    }).save();

    res.status(201).json({ sale, updatedStock: product.quantity });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

app.get('/sales', authMiddleware, handleGetSales);
app.post('/sales', authMiddleware, handlePostSale);
app.get('/api/sales', authMiddleware, handleGetSales);
app.post('/api/sales', authMiddleware, handlePostSale);


/* Charts API */
app.get('/api/charts/categories', authMiddleware, async (req, res) => {
  try {
    const colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#f43f5e', '#84cc16'];

    // Get all categories from the Category collection
    const allCategories = await Category.find({}, 'name').lean();

    // Get product counts grouped by category
    const productCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    productCounts.forEach(p => { countMap[p._id] = p.count; });

    // Build chart data: every category gets a slice, even with 0 products
    const chartData = allCategories.map((cat, index) => ({
      name: cat.name,
      value: countMap[cat.name] || 0,
      color: colors[index % colors.length]
    }));

    // Also include product categories not yet in Category collection (legacy data)
    productCounts.forEach(p => {
      if (p._id && !allCategories.find(c => c.name === p._id)) {
        chartData.push({
          name: p._id,
          value: p.count,
          color: colors[chartData.length % colors.length]
        });
      }
    });

    if (chartData.length === 0) {
      return res.json([{ name: 'No Categories', value: 1, color: '#64748b' }]);
    }

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* Stats */
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStock = await Product.countDocuments({ stock: { $in: ['low', 'critical'] } });
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const stockStatusBreakdown = await Product.aggregate([
      { $group: { _id: '$stock', count: { $sum: 1 } } }
    ]);
    const totalSales = await Sale.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    
    // Calculate real turnover rate (Total Sales / Avg Inventory Value)
    const avgInvValue = await Product.aggregate([{ $group: { _id: null, avg: { $avg: { $multiply: ['$quantity', '$price'] } } } }]);
    const turnover = avgInvValue[0]?.avg > 0 ? (totalSales[0]?.total || 0) / avgInvValue[0].avg : 0;

    res.json({
      totalProducts,
      lowStock,
      categories,
      stockStatusBreakdown,
      totalSales: totalSales[0]?.total || 0,
      turnoverRate: turnover.toFixed(2)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Missing charts endpoints */
app.get('/api/charts/flow', authMiddleware, async (req, res) => {
  try {
    const history = await StockHistory.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          inflow: { $sum: { $cond: [{ $eq: ["$type", "inflow"] }, "$quantity", 0] } },
          outflow: { $sum: { $cond: [{ $eq: ["$type", "outflow"] }, "$quantity", 0] } }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 14 }
    ]);

    const flows = history.map(h => ({
      time: h._id,
      inflow: h.inflow,
      outflow: h.outflow
    }));

    if (flows.length === 0) {
      return res.json([
        { time: 'Yesterday', inflow: 0, outflow: 0 },
        { time: 'Today', inflow: 0, outflow: 0 }
      ]);
    }

    res.json(flows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/charts/projections', authMiddleware, async (req, res) => {
  // Mock projection data
  const projections = [
    { name: 'Mon', actual: 85, projected: 90, capacity: 100 },
    { name: 'Tue', actual: 92, projected: 88, capacity: 100 },
    { name: 'Wed', actual: 78, projected: 95, capacity: 100 },
    { name: 'Thu', actual: 95, projected: 92, capacity: 100 },
    { name: 'Fri', actual: 88, projected: 98, capacity: 100 },
    { name: 'Sat', actual: 102, projected: 85, capacity: 100 },
    { name: 'Sun', actual: 0, projected: 75, capacity: 100 }
  ];
  res.json(projections);
});

/* AI Chatbot API */
app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();
    
    // Simple rule-based AI logic
    if (lowerMsg.includes('low stock') || lowerMsg.includes('critical')) {
      const lowStockProducts = await Product.find({ stock: { $in: ['low', 'critical'] } });
      if (lowStockProducts.length === 0) {
        return res.json({ reply: "Great news! No items are currently at low or critical stock levels." });
      }
      const list = lowStockProducts.map(p => `${p.name} (${p.quantity} left)`).join(', ');
      return res.json({ reply: `The following items are running low: ${list}. I recommend restocking soon.` });
    }
    
    if (lowerMsg.includes('total sales') || lowerMsg.includes('revenue')) {
      const totalSales = await Sale.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
      const amount = totalSales[0]?.total || 0;
      return res.json({ reply: `Total sales recorded in the system is ₹${amount.toLocaleString('en-IN')}.` });
    }

    if (lowerMsg.includes('inventory count') || lowerMsg.includes('how many products')) {
      const count = await Product.countDocuments();
      return res.json({ reply: `There are currently ${count} unique SKUs in the repository.` });
    }

    // Default response
    res.json({ reply: "I can help you monitor stock levels, check sales stats, or identify critical items. Try asking 'Which items are low on stock?'" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Alerts API - computes live alerts from real product data using ROP/EOQ */
const computeROP = (qty) => Math.floor((qty < 50 ? 50 : 150) * 0.2);
const computeEOQ = (qty, price) => {
  const demand = qty > 0 ? qty * 12 : 500;
  const orderCost = 50;
  const holdingCost = Math.max(0.5, price * 0.1);
  return Math.floor(Math.sqrt((2 * demand * orderCost) / holdingCost));
};

app.get('/api/alerts', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({});
    const alerts = [];
    const now = new Date();

    products.forEach(p => {
      const rop = computeROP(p.quantity);
      const eoq = computeEOQ(p.quantity, p.price);

      if (p.quantity === 0) {
        alerts.push({
          id: `out-${p.id}`,
          productId: p.id,
          productName: p.name,
          type: 'Out of Stock',
          severity: 'high',
          message: `${p.name} (${p.id}) is completely out of stock. Immediate restock required.`,
          action: `Restock now — EOQ suggests ordering ${eoq} units`,
          rop,
          eoq,
          currentStock: p.quantity,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } else if (p.stock === 'critical' || p.quantity <= 10) {
        alerts.push({
          id: `critical-${p.id}`,
          productId: p.id,
          productName: p.name,
          type: 'Critical Stock',
          severity: 'high',
          message: `${p.name} (${p.id}) has only ${p.quantity} units left — below critical threshold.`,
          action: `Restock now — EOQ suggests ordering ${eoq} units`,
          rop,
          eoq,
          currentStock: p.quantity,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } else if (p.stock === 'low' || p.quantity <= rop) {
        alerts.push({
          id: `low-${p.id}`,
          productId: p.id,
          productName: p.name,
          type: 'Low Stock / Reorder Point',
          severity: 'medium',
          message: `${p.name} (${p.id}) has ${p.quantity} units — at or below ROP of ${rop}. Order soon.`,
          action: `Reorder ${eoq} units (EOQ) to maintain stock levels`,
          rop,
          eoq,
          currentStock: p.quantity,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });

    // Sort: high severity first
    alerts.sort((a, b) => (a.severity === 'high' ? -1 : b.severity === 'high' ? 1 : 0));
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Restock API - increase product stock and save to DB */
app.post('/api/restock', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({ error: 'productId and a positive quantity are required' });
    }
    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ error: `Product '${productId}' not found` });

    product.quantity += Number(quantity);
    // Recalculate stock status
    if (product.quantity === 0) product.stock = 'critical';
    else if (product.quantity <= 10) product.stock = 'critical';
    else if (product.quantity <= 30) product.stock = 'low';
    else product.stock = 'optimal';
    await product.save();

    // Record history
    await new StockHistory({
      productId: product.id,
      productName: product.name,
      type: 'inflow',
      quantity: Number(quantity)
    }).save();

    res.json({ message: 'Restocked successfully', product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log('Server running on 5000'));
