const mongoose = require('mongoose');
const walletModel = require('../models/wallet-model');
const ordersModel = require('../models/order-model');
const userModel = require('../models/userModel')
const { ObjectId } = require('mongodb');
const slugify = require('slugify');
const orderModel = require('../models/order-model');
const invoiceModel = require("../models/invoice-model")

//Razorpay//
const Razorpay = require('razorpay')
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


module.exports = {

  cancelOrder: async (product, totalAmount, orderStatus) => {
    try {
      console.log('👍 product in cancelOrder 👍', product[0].paymentMethod, orderStatus, '👍 product in cancelOrder 👍');

      await orderModel.updateOne({ _id: product[0]._id },
        {
          $set: {
            "products.0.orderStatus": orderStatus
          }
        });

      if (product[0].paymentMethod === 'ONLINE' || product[0].paymentMethod === 'WALLET') {
        let userId = product[0].userId;
        console.log(userId, '❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️');

        let wallet = await walletModel.findOne({ userId: product[0].userId })
        console.log(wallet, '🌹🌹 wallet 🌹🌹');

        if (!wallet) {
          wallet = new walletModel({
            userId: userId,
            balance: 0,
          });
          console.log(wallet, '🌹🌹 wallet 🌹🌹');
          await wallet.save();
        };
        wallet.balance += Number(totalAmount);
        await wallet.save();
        console.log(wallet, '🌹🌹 wallet 🌹🌹');

      } else {
        console.log('COD => PRODUCT CANCEL SUCCESS');

      }

    } catch (error) {
      console.log(error.message);
    }
  },
  returnOrder: async (product, totalAmount, orderStatus) => {
    try {
      console.log('👍 product in ReturnOrder 👍', product, orderStatus, totalAmount, '👍 product in ReturnOrder 👍');
      console.log(product[0].products.orderStatus);

      if (product[0].products.orderStatus === 'deliver') {
        console.log('//////**********************************684654*');

        product[0].products.orderStatus = orderStatus;

        await orderModel.updateOne(
          { _id: product[0]._id },
          {
            $set: {
              "products.0.orderStatus": orderStatus
            }
          }
        );

        console.log(product, 'status changed to returned');
      } else if (product[0].products.orderStatus === 'returned') {

        await orderModel.updateOne({ _id: product[0]._id },
          {
            $set: {
              "products.0.orderStatus": orderStatus
            }
          });

        if (product[0].paymentMethod === 'ONLINE' || product[0].paymentMethod === 'WALLET' || product[0].paymentMethod === 'COD') {
          let userId = product[0].userId;
          console.log(userId, '❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️');

          let wallet = await walletModel.findOne({ userId: product[0].userId })
          console.log(wallet, '🌹🌹 wallet 🌹🌹');

          if (!wallet) {
            wallet = new walletModel({
              userId: userId,
              balance: 0,
            });
            await wallet.save();
          };

          wallet.balance += Number(totalAmount);
          await wallet.save();
          console.log(wallet, product[0].paymentMethod, '🌹🌹 wallet 🌹🌹');

          console.log(wallet.balance, ' => PRODUCT CANCEL SUCCESS');

        } else {
          console.log('COD => PRODUCT CANCEL SUCCESS');

        }

      }

    } catch (error) {
      console.log(error.message);
    }
  },

  orderProducts: async (orderId, proSlug) => {
    try {
      console.log(orderId, proSlug, "/////////////////////////////")

      let product = await ordersModel.aggregate([
        { $match: { _id: new ObjectId(orderId) } },
        { $unwind: "$products" }, // Unwind the products array
        { $match: { "products.slug": proSlug } } // Match the proSlug within the products array
      ])

      console.log(product, "pro got /////////")
      return product;

    } catch (error) {
      console.log(error.message);
    }
  },

  productDetails: async (orderId) => {
    try {
      console.log(orderId);
      const orderData = await ordersModel.findOne({ _id: orderId })
      console.log('👍😁👍', orderData, '👍😁👍');
      // if(!orderData.products){
      //   return false;
      // }
      return orderData;

    } catch (error) {
      console.log(error.message);
    }
  },

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

      console.log("😊orders😊", orders[0].products, "😊orders😊");
      return orders;
    } catch (error) {
      console.log(error.message);
      throw error;
    }

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
      await Orders.products.updateOne({ $set: { status: status } });
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

        // let hmac = crypto.createHmac('sha256', 'M8TOqqPjxqfp5ZiAF3qZaM13');
        let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        console.log(hmac, '------------------------------------->');
        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
        hmac = hmac.digest('hex');

        if (hmac === details.payment.razorpay_signature) {
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

  statusChange: async (orderStatus, proSlug, orderId, product) => {
    try {
      return new Promise(async (resolve, response) => {

        console.log(orderStatus, '😷orderStatus in order-helper : statusChange😷');
        console.log(orderId, '😷orderId in order-helper : statusChange😷');

        console.log(proSlug, 'proSlug in order-helper : changeStatus😷');
        let orders = await orderModel.findOne({ _id: orderId })
        if (orders.paymentMethod != 'COD') {
          if (orderStatus === 'order-placed' || orderStatus === 'shipped' || orderStatus === 'out-of-delver' || orderStatus === 'deliver') {
            console.log(' if in order placed 💸💸💸💸💸💸💸💸💸💸💸💸💸💸');
            await orderModel.updateOne(
              { _id: orderId, "products.slug": proSlug },

              {
                $set: {
                  "products.$.deliveryStatus": 'payed',
                  "products.$.orderStatus": orderStatus
                }
              },

            ).then(() => {
              resolve()
            })
          } else if (orderStatus === 'cannel' || orderStatus === 'return') {
            console.log(' else in order placed 💸💸💸💸💸💸💸💸💸💸💸💸💸💸');

            await orderModel.updateOne(
              { _id: orderId, "products.slug": proSlug },
              {
                $set: {
                  "products.$.deliveryStatus": 'refunded',
                  "products.$.orderStatus": orderStatus
                }
              },

            ).then(() => {
              resolve()
            })
          }
        } else {
          if (orderStatus === 'order-placed' || orderStatus === 'shipped' || orderStatus === 'out-of-delver') {
            console.log(' if in order placed 💸💸💸💸💸💸💸💸💸💸💸💸💸💸');
            await orderModel.updateOne(
              { _id: orderId, "products.slug": proSlug },

              {
                $set: {
                  "products.$.deliveryStatus": 'pending',
                  "products.$.orderStatus": orderStatus
                }
              },

            ).then(() => {
              resolve()
            })
          } else if (orderStatus === 'cannel' || orderStatus === 'return') {
            console.log(' else if in COD order placed 💸💸💸💸💸💸💸💸💸💸💸💸💸💸');

            await orderModel.updateOne(
              { _id: orderId, "products.slug": proSlug },
              {
                $set: {
                  "products.$.deliveryStatus": 'refunded',
                  "products.$.orderStatus": orderStatus
                }
              },

            ).then(() => {
              resolve()
            })
          } else if (orderStatus === 'deliver') {
            console.log(' else if  in   COD deliver 💸💸💸💸💸💸💸💸💸💸💸💸💸💸');
            await orderModel.updateOne(
              { _id: orderId, "products.slug": proSlug },

              {
                $set: {
                  "products.$.deliveryStatus": 'pending',
                  "products.$.orderStatus": orderStatus
                }
              },

            ).then(() => {
              resolve()
            })
          }
        }

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
        console.log('🥶 userId in order-helper :userAddress 🥶', address, '🥶 userId in order-helper :userAddress 🥶');
        resolve(address);
        if (!address) {
          console.log('no address');
          resolve({ address: [] });

        }
        resolve(address);

      })

    } catch (error) {
      reject('no user address')
      console.log(error.message);
    }
  },
  getInvoice: async (product) => {
    try {
      console.log(product, 'product showing in ordersHelper❤️');

      // Create and save an invoice document
      
      const sampleInvoiceData = await invoiceModel.create() ;
      const newInvoice = new invoiceModel(sampleInvoiceData);
      newInvoice.save()
        .then((savedInvoice) => {
          console.log('Invoice saved successfully:', savedInvoice);
        })
        
    } catch (error) {
      console.log(error.message);
    }
  },
  

}
