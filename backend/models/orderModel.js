import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      specifications: {
        color: String,
        size: String
      }
    }
  ],
  pricing: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  shipping: {
    address: {
      fullName: { type: String, required: true },
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true }
    },
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight'],
      default: 'standard'
    },
    estimatedDelivery: Date,
    trackingNumber: String
  },
  payment: {
    method: {
      type: String,
      enum: ['cash_on_delivery'],
      default: 'cash_on_delivery'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  },
  status: {
    current: {
      type: String,
      enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed'
    },
    history: [
      {
        status: {
          type: String,
          enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        note: String
      }
    ]
  },
  dates: {
    placed: { type: Date, default: Date.now },
    confirmed: Date,
    shipped: Date,
    delivered: Date
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const year = new Date().getFullYear();
    this.orderNumber = `WM-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Add status change to history
orderSchema.pre('save', function(next) {
  if (this.isModified('status.current')) {
    this.status.history.push({
      status: this.status.current,
      timestamp: new Date(),
      note: `Order ${this.status.current}`
    });

    // Update corresponding date
    if (this.status.current in this.dates) {
      this.dates[this.status.current] = new Date();
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;