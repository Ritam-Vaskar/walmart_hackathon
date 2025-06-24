import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: {
    original: { type: Number, required: true },
    current: { type: Number, required: true },
    discount: { type: Number, default: 0 }
  },
  images: [{ type: String, required: true }],
  specifications: {
    weight: String,
    dimensions: String,
    color: String,
    material: String,
    model: String
  },
  inventory: {
    stock: { type: Number, required: true, default: 0 },
    reserved: { type: Number, default: 0 },
    available: { type: Number, default: 0 }
  },
  dates: {
    manufacturingDate: Date,
    expiryDate: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  warranty: {
    duration: String,
    type: String,
    terms: String
  },
  shipping: {
    weight: String,
    dimensions: String,
    freeShipping: { type: Boolean, default: false },
    estimatedDelivery: String
  },
  ratings: {
    average: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    breakdown: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  seo: {
    slug: { type: String, required: true, unique: true },
    metaTitle: String,
    metaDescription: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out-of-stock'],
    default: 'active'
  },
  tags: [String],
  seller: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    verified: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Update available inventory before saving
productSchema.pre('save', function(next) {
  this.inventory.available = this.inventory.stock - this.inventory.reserved;
  next();
});

// Create slug from name before saving
productSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  this.seo.slug = this.name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;