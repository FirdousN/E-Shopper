var express = require('express');
var router = express.Router();
const{ getError,resendOtp,verifyOtp,generateOtp,getOtpLogin,getOtpSend,getHome, getLogin, postLogin, getSignup, postSignup ,getLogout , getShop, shopDetail,getProductsByCategory,getFilteredProducts }=require('../controllers/userController');
const{ getAddCart,getCart,cartCount,postProductQuantity ,removeCartProduct} = require('../controllers/cartController');
const{getInvoice,postOrderReturn, postOrderCancel,getProductStatus , getCheckOut ,postCheckout,getOrderStatus ,postVerifyPayment ,getSuccessPage} = require ('../controllers/ordersController')
const{postApplyCoupon} = require ('../controllers/couponController')
const session =require('express-session');
const{deleteAddress, postAddAddress, getAddAddress ,postEditAddress,getEditAddress,getUserAddress , getUserProfile} = require ('../controllers/addressController')
// const {paymentModel} = require('../models/paymentModel')
const { client } = require("../config/twilio");


const verifyLogin=(req,res,next)=>{
  if(req.session.user ){
    if(req.session.user.status){
      next()
      }else{
        res.redirect('/logout')
      }
  }else{
      res.redirect('/login')
  }
}


//******************************/ OTP \***************** */

// user signup with OTP

router.get('/otp-login',getOtpLogin);

router.post('/generate-otp',generateOtp)

router.get('/otp-send',getOtpSend);

router.post('/verify-otp',verifyOtp);

router.post('/resendOtp',resendOtp )

//******************************/ OTP \***************** */

// users signup
router.get('/signup', getSignup)

router.post('/signup', postSignup)

// user login
router.get('/login', getLogin)

router.post('/login', postLogin)

// user logout
router.get('/logout',getLogout)

// user forgot password
router.get('/forgot-Password', (req, res) => {
  res.render('users/forgot-Password', { noShow: true })
})

router.post('/forgot-Password', (req, res) => {
  res.render('users/login', { noShow: true })
})

/* GET users listing. */
router.get('/', getHome);

// user shop
router.get('/shop', getShop)

router.post('/getFilteredProducts', getFilteredProducts);

router.get('/cart/count', verifyLogin,cartCount)

router.get('/category/:category', getProductsByCategory);

// user shopDetail page
router.get('/detail',verifyLogin, shopDetail)

// user cart
router.get('/cart',verifyLogin,getCart)

router.get('/add-to-cart/:slug/:page',verifyLogin,getAddCart)

router.post('/change-product-quantity/:slug/:cartId',postProductQuantity)

router.delete('/remove-cart-product/:slug',removeCartProduct)


//USER PAYMENT & CHECKOUT & Orders PAGE

router.get('/checkout',verifyLogin,getCheckOut)

router.post('/checkout',verifyLogin, postCheckout)

router.get('/success-page',verifyLogin, getSuccessPage)

router.post('/verify-payment',verifyLogin,postVerifyPayment)

router.post('/apply-coupon',verifyLogin,postApplyCoupon)

router.post('/order-cancel/:orderId/:proSlug/:totalAmount/:value',verifyLogin, postOrderCancel);

router.post('/order-return/:orderId/:proSlug/:totalAmount/:value',verifyLogin, postOrderReturn);

router.get('/order-status',verifyLogin,getOrderStatus)

router.get('/product-status/:_id/:slug',verifyLogin, getProductStatus);

router.get('/invoice/:orderId/:proSlug/',verifyLogin,getInvoice)

// ERROR PAGE
router.get('/errorPage',getError)

//USER ADDRESS MANAGEMENT

router.get('/user-profile',verifyLogin, getUserProfile)

router.get('/user-address',verifyLogin, getUserAddress)

router.get('/add-userAddress',verifyLogin,getAddAddress)

router.post('/add-userAddress',verifyLogin,postAddAddress)

router.get('/edit-address/:addressId',verifyLogin, getEditAddress)

router.post('/edit-address',verifyLogin,postEditAddress)

router.delete('/remove-address/:addressId/',verifyLogin,deleteAddress)

module.exports = router;

