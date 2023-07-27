const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  productName: String,
  productPrice: Number,
  description: String,
  category: String, 
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // This should be the model name for the Category schema
  },  
  subcategory: String,
  stockQuantity: Number,
  product_stock: Number,
  product_size: Array,
  offerPrice: {
    type: Number,
    default: 0,
  },
  image: [],
  deleted: {
    type: Boolean,
    default: false,
  },
  isStock: {
    type: Boolean,
    default: true,
  },
  slug: {
    type: String,
    unique: true,
  },
});

// productSchema.pre('save', function (next) {
//   this.slug = slugify(this.productName, { lower: true });
//   next();
// });

module.exports = mongoose.model('Product', productSchema);
