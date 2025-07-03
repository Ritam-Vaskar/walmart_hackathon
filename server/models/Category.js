import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
      unique: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide an image URL'],
    },
    icon: {
      type: String,
      required: [true, 'Please provide an icon name'],
    },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;