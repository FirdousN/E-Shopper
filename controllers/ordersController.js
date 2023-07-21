const mongoose = require("mongoose");
const ordersModel = require("../models/order-model")
const cartHelper = require('../helpers/cart-helper')
const ordersHelper = require("../helpers/orders-helper");
const slugify = require('slugify');
// const ordersModel = require("../models/order-model");
const walletModel = require("../models/wallet-model");
const productHelpers = require("../helpers/product-helpers");
const productModel = require ("../models/product-model")
const invoiceModel = require("../models/invoice-model");
const userHelper = require("../helpers/user-helper");
const userModel = require("../models/userModel");
const jsPDF = require('jspdf');
const PDFDocument = require('pdfkit');
const html2canvas = require('html2canvas');

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

      // let orders = await ordersHelper.productDetails( orderId ,);
      // console.log('🌹🌹 orders DATA 🌹🌹',orders, '🌹🌹 orders DATA 🌹🌹');

      // for(const item of orders){
      //   const products = await productModel.findOne({ _id:})
      // }

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

      console.log(orders, '😁😁');
      console.log('🌹🌹🌹', product, '🌹🌹🌹');

      // const getProductQuantity = (productId) => {
      //   const product = orders.products.find((item) => item.item.toString() === productId.toString());
      //   return product ? product.quantity : 0;
      // };

      // console.log(getProductQuantity(product.quantity),'/*/*/*/*/*//*/');

      res.render('users/product-status', { user, product, orders });
    } catch (error) {
      console.log(error.message);
    }
  },

  // getInvoice: async (req, res) => {
  //   try {
  //     let orderId = req.params.orderId;

  //     let proSlug = req.params.proSlug;
  //     console.log(orderId, proSlug, '1111111110000000');

  //     // Get the order details first
  //     let orders = await ordersHelper.productDetails(orderId);

  //     // Now that we have 'orders', let's get other required data
  //     let product = await ordersHelper.orderProducts(orderId, proSlug);

  //     if (!product || product.length === 0) {
  //         return res.status(404).render('users/error', { errorMessage: 'Product not found' });
  //     }

  //     let user = await userModel.findById(product[0].userId);
  //     let userName = user ? user.name : 'Unknown User';

  //     console.log('🌹🌹🌹', product, '🌹🌹🌹');
  //     product.forEach((products) => {
  //         console.log('0111111111000000000',products.products, '0111111111000000000');
  //     });

  //     res.render('users/invoice', {
  //         userName,
  //         product,
  //         orders,
  //         noShow: true,
  //         other:true,
  //     });

  // } catch (error) {
  //     console.log(error.message);
  //     res.status(500).render('users/error', { errorMessage: 'Internal Server Error' });
  // }
  // },

  getCheckOut: async (req, res) => {
    try {
      if (!req.session.user || !req.session.user._id) {
        throw new Error('User not authenticated');
      }

      const userId = req.session.user._id;
      const user = req.session.user;

      const userAddress = await ordersHelper.userAddress(userId);
      console.log('🥶 userId in orderController :userAddress 🥶', userAddress.addresses, '🥶 userId in orderController :userAddress 🥶');
      console.log('🥶 userId in orderController :userAddress 🥶', userAddress, '🥶 userId in orderController :userAddress 🥶');

      let address = userAddress.addresses;
      let pro = await productModel.find()
      const products = await cartHelper.getCartProduct(userId);
      const total = await cartHelper.getTotalAmount(pro,products);
      let wallet = await walletModel.findOne({ userId: userId });
      console.log(wallet.balance, 'wallet');

      if (!address || !wallet) {
        res.render('users/checkout', { wallet: [], address: [], user, total, products });
      } else {
        res.render('users/checkout', { wallet, address: [address], userAddress, user, total, products });
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
      // let deliveryStatus = "placed";
      let totalPrice = await cartHelper.getTotalAmount(products)

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
      res.render('admin/orders', { admin: true, orders, totalProductsCount })

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

  getProductDetails: async (req, res) => {
    try {
      console.log('getOrders in controllers');

      const orderId = req.params.orderId;

      let orderData = await ordersModel.findOne({ _id: orderId })

      console.log('🥶🥶🥶', orderData, '🥶🥶🥶');

      res.render('admin/product-details', { admin: true, orderData })
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
      console.log('🤣order data in order-helper🤣', orderData, '🤣order data in order-helper🤣');

      let userId = [...new Set(orderData.map((order) => order.userId))];
      console.log(userId, "😁 userId in getStatus in ordersController 😁");

      let orders = await ordersHelper.getUserOrders(userId)

      console.log('❤️❤️❤️', orders, '❤️❤️❤️❤️');

      res.render('users/order-status', { user, orders })
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

      res.render('admin/sales-report', { orders, admin: true })
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
      res.render('admin/chart-chartjs', { admin: true })
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
