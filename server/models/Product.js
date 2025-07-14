import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    image: {
      type: String,
      required: [true, 'Please provide an image URL'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    brand: {
      type: String,
      required: [true, 'Please provide a brand'],
    },
    features: {
      type: [String],
      default: [],
    },
    hasARModel: {
      type: Boolean,
      default: false
    },
    arModelType: {
      type: String,
      enum: ['apparel', 'furniture'],
      required: function() {
        return this.hasARModel;
      }
    },
    arModelUrl: {
      type: String,
      required: function() {
        return this.hasARModel;
      }
    }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;