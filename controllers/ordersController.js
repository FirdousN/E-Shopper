const mongoose = require("mongoose");
const ordersModel = require("../models/order-model")
const cartHelper = require('../helpers/cart-helper')
const ordersHelper = require("../helpers/orders-helper");
const productModel = require("../models/product-model")
const slugify = require('slugify');
const orderModel = require("../models/order-model");

module.exports = {

  getCheckOut: async (req, res) => {
    try {
      if (!req.session.user || !req.session.user._id) {
        
        throw new Error('User not authenticated');
      }
      const userId = req.session.user._id;
      const user = req.session.user;

      const userAddress = await ordersHelper.userAddress(userId);
      console.log('🥶 userId in orderController :userAddress 🥶', userAddress.addresses.name , '🥶 userId in orderController :userAddress 🥶');
      console.log('🥶 userId in orderController :userAddress 🥶', userAddress , '🥶 userId in orderController :userAddress 🥶');

      let address = userAddress.addresses;
      
      const products = await cartHelper.getCartProduct(userId);
      const total = await cartHelper.getTotalAmount(products);

      if(!address){
        res.render('users/checkout', {address:[], user, total, products });

      }else{
        res.render('users/checkout', {address:[address] ,userAddress, user, total, products });

      }

    } catch (error) {
      console.log(error.message);
      res.status(500).send('Error during checkout/ NO products');
    }
  },

  postCheckout: async (req, res) => {
    try {
      console.log(req.body);
      
      let user = req.session.user
      let userAddress = req.body
      let userId = user._id

      let address = await cartHelper.getUserAddress(userAddress, userId)

      
      console.log(address, '🌹cartController User Address🌹');
      console.log(userAddress.userId, '🌹🌹userId🌹🌹');
      console.log(userAddress, '🌹🌹 userAddress 🌹🌹');

      let products = await cartHelper.getCartProductList(userId);

      let totalPrice = await cartHelper.getTotalAmount(products)

      await cartHelper.placeOrder(address, req.body.paymentMethod, userId, products, totalPrice).then(
        (orderId) => {
          if (req.body['paymentMethod'] == 'COD') {
            // res.render('users/success-page',{layout:false})
            res.json({ codSuccess: true })
          } else {
            ordersHelper.generateRazorpay(orderId, totalPrice).then((response) => {
              res.json({ ONLINE: true, order: response })
              // res.render('users/success-page' , {layout:false , razorpayResponse : response})
            })
          }

        })

      console.log(userAddress);

    } catch (error) {
      console.log(error.message);
    }
  },
  //admin routes connection to controller
  getOrders: async (req, res) => {

    try {
      console.log('getOrders in controllers');


      let orderData = await orderModel.find()
      console.log(orderData);

      let userId = [...new Set(orderData.map((order) => order.userId))];
      console.log(userId, '❤️userIds❤️');

      let orders = await ordersHelper.getUserOrders(userId)

      res.render('admin/orders', { admin: true, orders })

    } catch (error) {
      console.log(error.message);
    }
    // try {
    //     const orders = await ordersHelper.getUserOrders();
    //     res.render('admin/orders', { orders });
    //   } catch (error) {
    //     console.log(error.message);
    //     res.status(500).send('Error occurred while fetching orders.');
    //   }
  },
  updateOrderStatus: async (req, res) => {
    try {
      const orderId = req.body.orderId;
      const action = req.body.action;

      // Update the order status based on the action using helpers
      await ordersHelper.updateOrderStatus(orderId, action);

      res.status(200).send('Order status updated successfully');
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  },

  //USER ROUTES CALLING;
  
  getStatus: async (req, res) => {
    try {
      let user = req.session.user

      let orderData = await orderModel.find();
      console.log('🤣order data in order-helper🤣', orderData, '🤣order data in order-helper🤣');

      let userId = [...new Set(orderData.map((order) => order.userId))];
      console.log(userId, "😁 userId in getStatus in ordersController 😁");

      let orders = await ordersHelper.getUserOrders(userId)

      console.log('❤️❤️❤️', orders, '❤️❤️❤️❤️');

      res.render('users/order-status', { user: user, orders })
    } catch (error) {
      console.log(error.message);
    }

  },

  postVerifyPayment: async (req, res) => {
    try {
      console.log(req.body, '😡verifyPayment in orderController😡');

      await ordersHelper.VerifyPayment(req.body).then(() => {

        ordersHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
          console.log('💸Payment Success💸');

          res.json({ status: true })
        })
      })

    } catch (error) {
      console.log(error.message);
      res.json({ status:false , errMsg :'Payment failed' })
    }

  },


  getSuccessPage: (req, res) => {
    res.render('users/success-page', { layout: false })
  },

  postStatus: async (req, res) => {
    try {
      let orderId = req.params.orderId;
      let status = req.body.status;

      console.log(status, '💸Order Status💸');
      console.log(orderId, '💸OrderId');

      await ordersHelper.statusChange( status, orderId)
      
      // await orderModel.updateOne({ orderId: orderId }, {
      //   $set: {

      //   }
      // })

      res.json({ message: ' Test route is working' });

    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: 'An error occurred' });

    }
  },
 

}