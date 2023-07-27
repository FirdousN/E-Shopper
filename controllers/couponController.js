const mongoose = require("mongoose");
const couponModel = require('../models/coupon-model');
const productModel = require('../models/product-model');
const couponHelper = require('../helpers/coupon-helper');
const categoryModel = require("../models/category-model");

module.exports = {
    getCoupons: async (req, res) => {
        try {
            let admin = req.session.admin;

            let coupons = await couponModel.find();
            console.log(coupons, '💸🌹 coupons 🌹💸');
            res.render('admin/coupons', { admin ,admin: true, coupons });
        } catch (error) {
            console.log(error.message);
        }
    },

    getAddCoupon: async (req, res) => {
        try {
            let admin = req.session.admin;
            let categories =await categoryModel.find()

            console.log(categories[0].category);
            res.render('admin/add-coupon', { admin,categories,admin: true });

        } catch (error) {
            console.log(error.message);
        }
    },

    postAddCoupon: async (req, res) => {
        try {

            let couponsData = req.body;
            console.log(couponsData);

            let couponName = couponsData.name;
            let couponDiscount = couponsData.discount;
            let couponExp = couponsData.expiryDate;

            console.log('💸couponName💸', couponName, '💸couponName💸');
            console.log('💸 couponDiscount 💸', couponDiscount, '💸 couponCode💸');
            console.log('💸couponExp💸', couponExp, '💸couponExp💸');

            let couponCode = await couponHelper.generateCouponCode(couponName, new Date(couponExp))

            console.log(couponCode, '🌹 coupon code in CONTROLLER🌹');

            await couponHelper.createCoupon(couponCode, couponName, couponDiscount, couponExp, res)

            let coupons = await couponModel.find()
            res.redirect('/admin/coupons')

        } catch (error) {
            console.log(error.message);
        }

    },
    postApplyCoupon: async (req, res) => {
        console.log('👻👻 COUPON APPLY IN CONTROLLER 👻👻');
        try {
            console.log('👻👻👻👻👻' ,req.body,'👻👻👻👻👻');
            console.log('👻👻👻👻👻' ,req.body.total,'👻👻👻👻👻');

            let cartTotal = 0;
            if(req.body.total){
                console.log('👻👻 COUPON APPLY SUCCESS 👻👻');

                cartTotal = parseInt(req.body.total.replace(/\D/g, ""));
            }else {
                console.log('👻👻 COUPON APPLY FAIL 👻👻');

                return res.json({ message:"Total amount is missing" , success: false })
            }
             
            console.log(cartTotal, '👻👻 cartTotal in coupon 👻👻');

            let matchCouponId = await couponModel.findOne({
                code: req.body.couponId,
                isActive: true, // check if the coupon is enabled
                expiryDate: { $gt: Date.now() },// check if the current date is before the expiry date
                
            })
            console.log(matchCouponId,'👻❤️ matchCoupon ❤️👻');

            if (!matchCouponId) {
                return  rew.json({ message: "Invalid coupon code", success: false })
            // } else if (cartTotal < matchCouponId.minPurchase) {
            //     return  res.json({
            //         message: 'Coupon requires minimum purchase of Rs.${matchCouponId.minPurchase}',
            //         success: false,
            //     })
            // } else if (cartTotal < matchCouponId.discount) {
            //     return  res.json({
            //         message: `Coupon amount exceeds total amount`,
            //         excess: true
            //     });
            } else {
                // let discountPercentage = (matchCouponId.discount / cartTotal) * 100;
                let discountPercentage = matchCouponId.discount;

                let discountAmount = Math.floor(cartTotal * (parseInt(matchCouponId.discount) / 100)) ;
                res.json({
                    message: `Coupon applied! You received a discount of Rs. ${discountAmount} (${discountPercentage}% of the total ${cartTotal})`,
                    success: true,
                    discountAmount,
                    // discountPercentage,
                    cartTotal,
                })
            }
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ error: "Server error" });

        }

    }
}
