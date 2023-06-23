const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const productSchema = new Schema({
  productName: String,
  productPrice: Number,
  description: String,
  category: String,
  subcategory:String,
  stockQuantity:Number,
  product_stock: Number,
  product_size:Array,
  
  image:[],
  deleted:{
    type:Boolean,
    default:false
  },
  
  isStock:{
    type:Boolean,
    default:true
  },
  slug: {
    type: String,
    unique: true },
});

// productSchema.pre('save', function (next) {
//   this.slug = slugify(this.productName, { lower: true });
//   next();
// });

module.exports = mongoose.model('Product', productSchema)