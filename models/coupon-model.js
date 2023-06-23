const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const couponSchema = new Schema({
    name:{
        type:String,
        required:true,
        
    },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discount: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
