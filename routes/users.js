var express = require('express');
var router = express.Router();
const{getError,resendOtp,verifyOtp,generateOtp,getOtpLogin,getOtpSend,getHome, getLogin, postLogin, getSignup, postSignup ,getLogout , getShop, shopDetail }=require('../controllers/userController');
const{ getAddCart,getCart,cartCount,postProductQuantity ,removeCartProduct} = require('../controllers/cartController');
const{getCheckOut ,postCheckout,getStatus ,postVerifyPayment ,getSuccessPage} = require ('../controllers/ordersController')
const{postApplyCoupon} = require ('../controllers/couponController')
const session =require('express-session');
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

/* GET users listing. */
router.get('/',verifyLogin, getHome);

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


// user shop
router.get('/shop',verifyLogin, getShop)

// user shopDetail page
router.get('/detail',verifyLogin, shopDetail)

// user cart
router.get('/cart',verifyLogin,getCart)

router.get('/add-to-cart/:id',verifyLogin,getAddCart)

router.post('/change-product-quantity/:slug/:cartId',postProductQuantity)

router.delete('/remove-cart-product/:slug',removeCartProduct)


//USER PAYMENT & CHECKOUT & Orders PAGE

router.get('/checkout',verifyLogin,getCheckOut)

router.post('/checkout',verifyLogin, postCheckout)

router.get('/order-status',verifyLogin,getStatus)

router.get('/success-page',verifyLogin, getSuccessPage)

router.post('/verify-payment',verifyLogin,postVerifyPayment)

router.post('/apply-coupon',postApplyCoupon)

// ERROR PAGE
router.get('/errorPage',getError)

module.exports = router;

