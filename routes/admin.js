var express = require('express');
var router = express.Router();
const { body } = require('express-validator');
const{getLogin, postLogin, getDashbord, getLogout, getUsersList ,blockUser ,insertUser,loadRegister}=require('../controllers/adminController');
const{ postAddProducts,getAddProducts,getProducts, getEditProducts, postEditProducts, postDeleteProduct , postForm, getForm }=require('../controllers/productController');
const{postEditCategory,getEditCategory, getAddCategory, postAddCategory, getCategoryList  }=require('../controllers/categoryController');
const { getOrders ,postStatus} = require('../controllers/ordersController');
const{getCoupons, getAddCoupon , postAddCoupon} = require('../controllers/couponController')

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
// const { route } = require('./users');

// let multer1=require("../config/multer")
const upload = require('../config/multer')
const verifyAdmin=(req,res,next)=>{
  if(req.session.admin){
      next()
  }else{
      res.redirect('/admin-login')
  }
}

/* GET home page. */

// admin dashboard
router.get('/',getDashbord)

// admin login
router.get("/admin-login",getLogin)

router.post('/admin-login',postLogin)

// admin Logout
router.get('/logout',getLogout)

// ***************************************USERS******************************************

// Admin userManagement
router.get('/users-List', getUsersList)


router.put('/users-List/:id',blockUser)


// ***************************************PRODUCTS******************************************



router.get('/products-List',getProducts)

// admin products add
router.get('/add-products',getAddProducts)

router.post('/add-products', upload.array('productImage',4),postAddProducts)

// admin products edit
router.get('/edit-products/:id',isValidId, getEditProducts)

router.post('/edit-products/:id',isValidId, postEditProducts,)

// admin products delete
router.get('/delete-products/:id',isValidId, postDeleteProduct)

// ***************************************PRODUCTS******************************************

router.get('/add-form',getForm)

// router.post('/add-from',multer1.array( 'productImage',4),postForm)

//*******************category************************//
router.get('/category-List',getCategoryList)

router.get('/add-category', getAddCategory)

router.post('/add-category',postAddCategory)

router.get('/edit-category/:id',getEditCategory)

router.post('/edit-category/:id',postEditCategory)
//*******************category************************//


/***********Order Management**************************/
router.get('/orders',getOrders)


router.post('/statusChange/:orderId',postStatus)

/***********Coupon Management**************************/

router.get('/coupons',getCoupons)

router.get('/add-coupon',getAddCoupon)

router.post('/add-coupon',postAddCoupon)


module.exports = router;
