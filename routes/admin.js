var express = require('express');
var router = express.Router();
const { body } = require('express-validator');
const{postSignup,getSignup,getLogin, postLogin, getDashboard, getLogout, getUsersList ,blockUser,getCostumers }=require('../controllers/adminController');
const{ postAddProducts,getAddProducts,getProducts, getEditProducts, postEditProducts, postDeleteProduct }=require('../controllers/productController');
const{postEditCategory,getEditCategory, getAddCategory, postAddCategory, getCategoryList  }=require('../controllers/categoryController');
const {getChart,postSalesReport,getSalesReport, getOrders ,postStatus, getProductDetails} = require('../controllers/ordersController');
const{getCoupons, getAddCoupon , postAddCoupon ,getEditCoupon ,postEditCoupon} = require('../controllers/couponController')
const{postEditBanner,getEditBanner,postAddBanner,getAddBanner,getBanner} = require ('../controllers/bannerController')

const { isValidObjectId } = require('mongoose');
// Middleware for handling invalid URLs
const isValidId = (req, res, next) => {
  const id = req.params.id;
  if (!id || !isValidObjectId(id)) {
    // Invalid ID, handle the error
    const error = new Error('Invalid ID');
    error.status = 400; // Bad Request
    return next(error);
  }
  next();
};

// let multer1=require("../config/multer")
const upload = require('../config/multer');
const Banner = require('../models/banner-model');

const verifyAdmin=(req,res,next)=>{
  if(req.session.admin){
      next()
  }else{
      res.redirect('/admin/admin-login')
  }
}

/* GET home page. */

// admin dashboard
router.get('/',getDashboard)

// admin login
router.get("/admin-login",getLogin)

router.post('/admin-login',postLogin)

// admin signup
router.get("/admin-signup",getSignup)

router.post("/admin-signup",postSignup)

// admin Logout
router.get('/logout',getLogout)

// ***************************************USERS & Costumers******************************************

// Admin userManagement
router.get('/users-List',verifyAdmin, getUsersList)

router.put('/users-List/:id',verifyAdmin,blockUser)

router.get('/costumers-list',verifyAdmin,getCostumers)

// ***************************************PRODUCTS******************************************
router.get('/products-List',verifyAdmin,getProducts)

// admin products add
router.get('/add-products',verifyAdmin,getAddProducts)

router.post('/add-products', upload.array('productImage',4),verifyAdmin,postAddProducts)

// admin products edit
router.get('/edit-products/:slug',verifyAdmin, getEditProducts)

router.post('/edit-products/:id', isValidId, upload.array('productImage', 4),verifyAdmin, postEditProducts)

// admin products delete
router.post('/delete-products/:id',isValidId, postDeleteProduct)

// ***************************************PRODUCTS******************************************

//*******************category************************//
router.get('/category-List',verifyAdmin,getCategoryList)

router.get('/add-category',verifyAdmin, getAddCategory)


router.post('/add-category',upload.array('categoryImage',4),verifyAdmin,postAddCategory)

router.get('/edit-category/:id',getEditCategory)

router.post('/edit-category/:id',upload.array('categoryImage',4),verifyAdmin,postEditCategory)
//*******************category************************//


/***********Order Management**************************/
router.get('/orders',verifyAdmin,getOrders)

router.post('/statusChange/:proSlug/:orderId',verifyAdmin,postStatus)

router.get('/product-details/:orderId',verifyAdmin,getProductDetails)

router.get('/sales-report',verifyAdmin,getSalesReport)

router.post('/sales-report',verifyAdmin, postSalesReport);

/***********Coupon Management**************************/

router.get('/coupons',verifyAdmin,getCoupons)

router.get('/add-coupon',verifyAdmin,getAddCoupon)

router.post('/add-coupon',verifyAdmin,postAddCoupon)

router.get('/edit-coupon/:couponId',verifyAdmin,getEditCoupon)

router.post('/edit-coupon/:couponId',verifyAdmin,postEditCoupon)

router.get('/chart-chartjs',getChart)

/******************** Banner **********************/

router.get('/banner',verifyAdmin,getBanner);

router.get('/add-banner',verifyAdmin,getAddBanner)

router.post('/add-banner', upload.array('bannerImage', 1),verifyAdmin, postAddBanner);

router.get('/edit-banner/:id',verifyAdmin,getEditBanner)

router.post('/edit-banner/:id', upload.array('bannerImage', 1),verifyAdmin, postEditBanner);

/******************************* */
module.exports = router;
