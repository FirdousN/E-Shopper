const mongoose = require("mongoose");
const ordersModel = require("../models/order-model")
const cartHelper = require('../helpers/cart-helper')
const ordersHelper = require("../helpers/orders-helper");
const slugify = require('slugify');
const categoryModel = require("../models/category-model");
const walletModel = require("../models/wallet-model");
const productHelpers = require("../helpers/product-helpers");
const productModel = require ("../models/product-model")
const userHelper = require("../helpers/user-helper");
const couponModel = require("../models/coupon-model");
const jsPDF = require('jspdf');
const PDFDocument = require('pdfkit');
const html2canvas = require('html2canvas');
const cartModel = require("../models/cart-model");

module.exports = {

  postOrderCancel: async (req, res) => {
    try {
      let orderId = req.params.orderId;
      let proSlug = req.params.proSlug;
      let totalAmount = req.params.totalAmount;
      let user = req.session.user;
      let value = req.params.value
      console.log(value, '0000000000000000000000000000000❤️❤️❤️❤️❤️❤️');
      // let userId = req.session.user._id;
      console.log(totalAmount, '❤️totalAmount❤️');
      console.log(orderId, '🌹🌹 orderId 🌹🌹');
      console.log(proSlug, '🌹🌹 proSlug 🌹🌹');
      console.log(user, '🌹🌹 user 🌹🌹');

      let product = await ordersHelper.orderProducts(orderId, proSlug);
      console.log(product, '🌹🌹 product 🌹🌹');

      let c = await ordersHelper.cancelOrder(product, totalAmount, value);

      // if(order.status)

      res.json({ message: 'Order canceled successfully' });


    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: 'An error occurred' });
    }

  },
  postOrderReturn: async (req, res) => {
    try {
      let orderId = req.params.orderId;
      let proSlug = req.params.proSlug;
      let totalAmount = req.params.totalAmount;
      let user = req.session.user;
      let value = req.params.value

      console.log(value, '0000000000000000000000000000000❤️❤️❤️❤️❤️❤️');
      console.log(totalAmount, '❤️totalAmount❤️');
      console.log(orderId, '🌹🌹 orderId 🌹🌹');
      console.log(proSlug, '🌹🌹 proSlug 🌹🌹');
      console.log(user, '🌹🌹 user 🌹🌹');

      let product = await ordersHelper.orderProducts(orderId, proSlug);
      console.log(product, '🌹🌹 product 🌹🌹');

      await ordersHelper.returnOrder(product, totalAmount, value);

    } catch (error) {
      console.log(error.message);
    }
  },

  getProductStatus: async (req, res) => {
    try {
      
      let proSlug = req.params.slug;
      let orderId = req.params._id;
      let user = req.session.user;
      console.log(orderId, '👍👍');
      console.log(proSlug, '👍👍');

      let orders = await ordersHelper.productDetails(orderId);
      let product = await ordersHelper.orderProducts(orderId, proSlug);
      let categories = await categoryModel.find()

      console.log(orders, '😁😁');
      console.log('🌹🌹🌹', product, '🌹🌹🌹');

      // const getProductQuantity = (productId) => {
      //   const product = orders.products.find((item) => item.item.toString() === productId.toString());
      //   return product ? product.quantity : 0;
      // };

      // console.log(getProductQuantity(product.quantity),'/*/*/*/*/*//*/');

      res.render('users/product-status', { user, product, orders ,categories});
    } catch (error) {
      console.log(error.message);
    }
  },

  getCheckOut: async (req, res) => {
    try {
      if (!req.session.user || !req.session.user._id) {
        throw new Error('User not authenticated');
      }
  
      const userId = req.session.user._id;
      const user = req.session.user;
      let categories = await categoryModel.find();
      let cart = await cartModel.findOne({ userId }); // Corrected here by passing an object
  
      const userAddress = await ordersHelper.userAddress(userId);
      console.log('🥶 userId in orderController :userAddress 🥶', userAddress.addresses, '🥶 userId in orderController :userAddress 🥶');
      console.log('🥶 userId in orderController :userAddress 🥶', userAddress, '🥶 userId in orderController :userAddress 🥶');
     
      // Fetch all active coupons for the user
      const currentDate = new Date();
      const coupons = await couponModel.find({ expiryDate: { $gte: currentDate } });

      let address = userAddress.addresses;
      const products = await cartHelper.getCartProduct(userId);
      // let pro = await productModel.find();
      console.log('cart📜', cart, 'cart📜');

      let pro = await cartHelper.cartProduct(cart)
      console.log('cartProd🧛🏻',pro,'cartProd🧛🏻');

      const total = await cartHelper.getTotalAmount(pro, products);
      console.log('jkjkjk nononono');

      let wallet = await walletModel.findOne({ userId: userId });
      if (!cart) {
        console.log('cart is empty');
        let errorMessage = "Oops! Cart is empty.";
        if (!address || !wallet || !categories || !coupons) {
          res.render('users/checkout', { wallet: [], address: [], user, total, products, categories: [], errorMessage ,coupons:[] });
        }
      } else {
        console.log('cart is exist');
        res.render('users/checkout', { wallet, address: [address], userAddress, user, total, products, categories ,coupons});
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
      let cart = await cartModel.findOne({ userId }); // Corrected here by passing an object

      let address = await cartHelper.getUserAddress(userAddress, userId)


      console.log(address, '🌹cartController User Address🌹');
      console.log(userAddress.userId, '🌹🌹userId🌹🌹');
      console.log(userAddress, '🌹🌹 userAddress 🌹🌹');

      let products = await cartHelper.getCartProductList(userId);
      // let deliveryStatus = "placed";
      let pro = await cartHelper.cartProduct(cart)      
      console.log(pro,'000001');
      const totalPrice = await cartHelper.getTotalAmount(pro, products);

      let orderData = req.body;
      console.log(orderData, '🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹👻👻');

      await cartHelper.placeOrder(address, orderData.paymentMethod, userId, products, totalPrice).then(
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
      let admin = req.session.admin;

      let orderData = await ordersModel.find()
      console.log('🥶🥶🥶', orderData, '🥶🥶🥶');

      let userId = [...new Set(orderData.map((order) => order.userId))];
      console.log(userId, '❤️userIds❤️');

      let orders = await ordersHelper.getUserOrders(userId)
      console.log(orders, '---------------------->orders');
      let totalProductsCount = 0;
      for (let i = 0; i < orders.length; i++) {
        totalProductsCount += orders[i].products[i];

      }
      res.render('admin/orders', {admin , admin: true, orders, totalProductsCount })

    } catch (error) {
      console.log(error.message);
    }
   
  },

  getProductDetails: async (req, res) => {
    try {
      console.log('getOrders in controllers');
      let admin = req.session.admin;

      const orderId = req.params.orderId;
      let orderData = await ordersModel.findOne({ _id: orderId })
      console.log('🥶🥶🥶', orderData, '🥶🥶🥶');

      res.render('admin/product-details', {admin , admin: true, orderData })
    } catch (error) {
      console.log(error.message);
    }
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

  getOrderStatus: async (req, res) => {
    try {
        let user = req.session.user

        let orderData = await ordersModel.find();
        let categories = await categoryModel.find()

        if (orderData === null) {
            console.log('NO orders, orders is empty');
            let errorMessage = "Oops! Looks like you haven't placed any orders yet."
            res.render('users/order-status', { user, orders: [], errorMessage, categories });
        } else {
            console.log('🤣order data in order-helper🤣', orderData, '🤣order data in order-helper🤣');
            let userId = [...new Set(orderData.map((order) => order.userId))];
            console.log(userId, "😁 userId in getStatus in ordersController 😁");

            let orders = await ordersHelper.getUserOrders(userId);
            console.log('❤️❤️❤️', orders, '❤️❤️❤️❤️');
            res.render('users/order-status', { user, orders, categories});
        }
    } catch (error) {
        console.log(error.message, '0001');
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
      res.json({ status: false, errMsg: 'Payment failed' })
    }

  },

  getSuccessPage: (req, res) => {
    res.render('users/success-page', { layout: false })
  },

  postStatus: async (req, res) => {
    try {
      let proSlug = req.params.proSlug;
      let orderId = req.params.orderId;
      let status = req.body.status;

      let product = await ordersHelper.orderProducts(orderId, proSlug);

      console.log(status, '💸Order Status💸');
      console.log(orderId, '💸OrderId');

      await ordersHelper.statusChange(status, proSlug, orderId, product)

      // await ordersModel.updateOne({ orderId: orderId }, {
      //   $set: {

      //   }
      // })

      res.json({ message: ' Test route is working' });

    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: 'An error occurred' });

    }
  },

  getSalesReport: async (req, res) => {
    try {

      let orders = await ordersModel.find()
        .populate({
          path: 'userId',
          model: 'User',
          select: 'name email' // select the fields you want to include from the User document
        })
        .populate({
          path: 'products.item',
          model: 'Product'
        })
        .exec();
      console.log(orders, "👍👍👍👍👍👍👍👍👍👍👍👍👍")
      if (req.session.admin.orderThisWeek) {
        orders = req.session.admin.orderThisWeek;
        req.session.admin.orderThisWeek = null;
      } else if (req.session.admin.orderThisMonth) {
        orders = req.session.admin.orderThisMonth;
        req.session.admin.orderThisMonth = null;
      } else if (req.session.admin.orderThisDay) {
        orders = req.session.admin.orderThisDay;
        console.log(orders, "'''''''''''''''''''''''''''''''''")
        req.session.admin.orderThisDay = null;
      }
      else if (req.session.admin.orderThisYear) {
        orders = req.session.admin.orderThisYear;
        req.session.admin.orderThisYear = null;
      } else {
        orders = orders;
      }
      let admin = req.session.admin;

      res.render('admin/sales-report', { admin ,orders, admin: true })
    } catch (error) {
      console.log(error.message);
    }
  },

  postSalesReport: async (req, res) => {
    try {
      console.log('post Sales Report');
      let selector = req.body.selector

      console.log(selector, 'report body');
      let year, month, weekStart, weekEnd, day;

      if (selector.startsWith('year')) {
        year = parseInt(selector.slice(5));
      } else if (selector.startsWith('month')) {
        const parts = selector.split('-');
        year = parseInt(parts[1]);
        month = parseInt(parts[2]);
      } else if (selector.startsWith('week')) {
        const today = new Date();
        weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6);
        console.log(weekStart, 'weekstart')
        console.log(weekEnd, 'weekEnd')

      } else if (selector.startsWith('day')) {
        day = new Date(selector.slice(4));
        day.setHours(0, 0, 0, 0);
      }


      if (weekStart && weekEnd) {
        const orderThisWeek = await ordersModel.find({ createdAt: { $gte: weekStart, $lte: weekEnd } }).populate({
          path: 'userId',
          model: 'User',
          select: 'name email' // select the fields you want to include from the User document
        })
          .populate({
            path: 'products.item',
            model: 'Product'
          })
          .exec();;
        if (!req.session.admin) {
          req.session.admin = {}; // Create the admin object if it doesn't exist
        }
        req.session.admin.orderThisWeek = orderThisWeek;
        console.log(orderThisWeek, 'details of this week');
        return res.redirect('/admin/sales-report')

      }

      if (year && month) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        const orderThisMonth = await ordersModel.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }).populate({
          path: 'userId',
          model: 'User',
          select: 'name email' // select the fields you want to include from the User document
        })
          .populate({
            path: 'products.item',
            model: 'Product'
          })
          .exec();;
        if (!req.session.admin) {
          req.session.admin = {}; // Create the admin object if it doesn't exist
        }
        req.session.admin.orderThisMonth = orderThisMonth;
        console.log(orderThisMonth, 'details of this month');
        return res.redirect('/admin/sales-report')

      }

      if (day) {
        const startOfDay = new Date(day);
        const endOfDay = new Date(day);
        endOfDay.setDate(endOfDay.getDate() + 1);
        endOfDay.setSeconds(endOfDay.getSeconds() - 1);
        const orderThisDay = await ordersModel.find({ createdAt: { $gte: startOfDay, $lte: endOfDay } }).populate({
          path: 'userId',
          model: 'User',
          select: 'name email' // select the fields you want to include from the User document
        })
          .populate({
            path: 'products.item',
            model: 'Product'
          })
          .exec();;
        console.log(req.session.admin, "//////////////////////////////////////");
        if (!req.session.admin) {
          req.session.admin = {}; // Create the admin object if it doesn't exist
        }
        req.session.admin.orderThisDay = orderThisDay;
        console.log(orderThisDay, 'details of this day');
        return res.redirect('/admin/sales-report')

      }
      if (year) {
        const orderThisYear = await ordersModel.find({ createdAt: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59, 999) } }).populate({
          path: 'userId',
          model: 'User',
          select: 'name email' // select the fields you want to include from the User document
        })
          .populate({
            path: 'products.item',
            model: 'Product'
          })
          .exec();;
        if (!req.session.admin) {
          req.session.admin = {}; // Create the admin object if it doesn't exist
        }
        req.session.admin.orderThisYear = orderThisYear;
        console.log(orderThisYear, 'details of this year')
        return res.redirect('/admin/sales-report')

      }
      // res.status(200).send('Sales report received successfully');

    } catch (error) {
      console.log(error.message);
      res.status(500).send('Error processing sales report');

    }
  },
  getChart: async (req, res) => {
    try {
      let admin = req.session.admin;
      res.render('admin/chart-chartjs', {admin, admin: true })
    } catch (error) {
      console.log(error.message);
    }
  },
  getInvoice: async (req, res) => {
    
    let proSlug = req.params.proSlug
    let orderId = req.params.orderId;
    console.log(proSlug, orderId, 'first pro second order')
    
    let product = await ordersHelper.orderProducts(orderId, proSlug);
    let user = req.session.user
    let userName = user.name;
    let orders = await ordersHelper.productDetails(orderId);
      
    console.log('orders❤️',orders, '❤️orders')

    console.log(product,userName, 'particular')

    res.render('users/invoice', { orders, product, userName, other: true , noShow:true });
  }

}
