const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = require("mongodb")

// const collection = require('../server/config/collections')

const orderSchema = new Schema({

   userId:ObjectId,
   deliveryDetails:[Object],

   paymentMethod:String,
   
   products:Object,
   status:String,
   totalAmount:Number,
   // discount:Number,
   paymentMethod:Object,
   // shipping_status:String
 
},{ timestamps: true })
   
module.exports = mongoose.model('order', orderSchema)

