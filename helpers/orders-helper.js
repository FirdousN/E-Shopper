const mongoose = require('mongoose');
const productModel = require('../models/product-model');
const ordersModel = require('../models/order-model');
const userModel = require('../models/userModel')
const { ObjectId } = require('mongodb');
const slugify = require('slugify');
const orderModel = require('../models/order-model');
//Razorpay//
const Razorpay = require('razorpay')
const instance = new Razorpay({
  key_id: 'rzp_test_qDYihCFFIbyJNj',
  key_secret: 'M8TOqqPjxqfp5ZiAF3qZaM13',
});


module.exports = {
  
  getUserOrders: async (userId) => {
    try {
      console.log(userId, "👍getUserOrders in helpers👍");

      let orders = await ordersModel.aggregate([
        { $match: { userId: { $in: userId } } },
        {
          $lookup: {
            from: "users", // Replace "users" with the actual name of the users collection
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },

      ]).exec();

      console.log(orders, "😊orders😊");
      return orders;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
    //     try {
    //         const orders = await Order.aggregate([
    //           {
    //             $lookup: {
    //               from: 'users',
    //               localField: 'userId',
    //               foreignField: '_id',
    //               as: 'user'
    //             }
    //           },
    //           { $unwind: '$user' }
    //         ]);
    //         return orders;
    //       } catch (error) {
    //         throw error;
    //       }
  },

  updateOrderStatus: async (orderId, action) => {
    try {
      let status = '';
      switch (action) {
        case 'cancel':
          status = 'Canceled';
          break;
        case 'ship':
          status = 'Shipped';
          break;
        case 'deliver':
          status = 'Delivered';
          break;
        default:
          status = 'Unknown';
          break;
      }

      await Orders.updateOne({ _id: orderId }, { $set: { status: status } });
    } catch (error) {
      throw error;
    }
  },

  OrderStatus: async (userId) => {
    try {
      console.log(userId, '😁 userID in order-helper😁');

      let orderData = await orderModel.find()
      console.log(orderData, '🤣order data in order-helper🤣');

      return orderData;
    } catch (error) {
      console.log(error.message);
    }
  },

  generateRazorpay: (orderId, total) => {
    try {
      console.log(orderId, total, 'generateRazorpay testing in order-helper.js file 💸💸💸');
      return new Promise((resolve, reject) => {
        var options = {
          amount: total * 100,  // amount in the smallest currency unit
          currency: "INR",
          receipt: String(orderId._id),
        };
        instance.orders.create(options, function (err, order) {
          console.log(err, order)
          if (err) {
            reject(err)
          } else {
            console.log('💸💸New Order💸💸 :', order, '💸💸new Order💸💸');
            resolve(order)
          }
        });
      })

    } catch (error) {
      console.log('catch in generateRazorpay');

      console.log(error.message);
    }
  },

  VerifyPayment: async (details) => {
    try {
      return new Promise((resolve, reject) => {
        const crypto = require('crypto');

        let hmac = crypto.createHmac('sha256', 'M8TOqqPjxqfp5ZiAF3qZaM13');
        hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
        hmac = hmac.digest('hex');

        if (hmac === details['payment[razorpay_signature]']) {
          resolve();
        } else {
          reject(new Error('Signature verification failed.'));
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  },


  changePaymentStatus: async (orderId) => {
    try {
      return new Promise(async (resolve, response) => {
        console.log(orderId, '😷orderId in order-helper : changePaymentStatus😷');
        await orderModel.updateOne({ _id: orderId },
          {
            $set: {
              status: 'Order placed'
            }
          }
        ).then(() => {
          resolve()
        })
      })
    } catch (error) {
      console.log(error.message);
    }
  },

  //ADMIN SIDE 

  statusChange: async (orderStatus, orderId) => {
    try {
      return new Promise(async (resolve, response) => {

        console.log(orderStatus, '😷orderStatus in order-helper : statusChange😷');
        console.log(orderId, '😷orderId in order-helper : statusChange😷');

        console.log(orderId, '😷orderId in order-helper : changePaymentStatus😷');


        await orderModel.updateOne({ _id: orderId },
          {
            $set: {
              status: orderStatus
            }
          }
        ).then(() => {
          resolve()
        })

      })


    } catch (error) {
      console.log(error.message);
    }
  },

  userAddress: async (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        console.log(userId, '🥶 userId in order-helper :userAddress 🥶');

      let address = await userModel.findOne({ _id: userId })
    console.log('🥶 userId in order-helper :userAddress 🥶', address , '🥶 userId in order-helper :userAddress 🥶');
      resolve (address);
      if(!address){
        console.log('no address');
        resolve({ address: [] });

      }
      resolve (address);

      })
      
    } catch (error) {
      reject('no user address')
      console.log(error.message);
    }
  }
}
