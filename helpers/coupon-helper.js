const mongoose = require('mongoose');
const productModel = require('../models/product-model');
const couponModel = require('../models/coupon-model');
const { ObjectId } = require('mongodb');


module.exports = {

    generateCouponCode: async (couponName, couponExp) => {
        try {

            const nameCode = couponName.substr(0, 3).toUpperCase();
            const yearCode = couponExp.getFullYear().toString().substr(-2);
            const randomCode = Math.floor(Math.random() * 900) + 100;
            const couponCode = `${nameCode}${yearCode}${randomCode}`;

            console.log(couponCode, '😡 coupon code in generate coupon code😡');
            return couponCode;

        } catch (error) {
            console.log(error.message);
        }

    },

    createCoupon: async (couponCode, couponName, couponDiscount, couponExp, res) => {
        try {
            console.log('🥶🥶 couponCode 🥶🥶', couponCode, '🥶🥶 couponCode 🥶🥶');
            console.log('🥶🥶 couponName 🥶🥶', couponName, '🥶🥶 couponName 🥶🥶');
            console.log('🥶🥶 couponDiscount 🥶🥶', couponDiscount, '🥶🥶 couponDiscount 🥶🥶');
            console.log('🥶🥶 couponExp 🥶🥶', couponExp, '🥶🥶 couponExp 🥶🥶');

            // const parsedDiscount = parseFloat(couponDiscount);
            // if (isNaN(parsedDiscount)) {
            //     console.log('Invalid coupon discount');
            //     return res.status(400).json({ error: 'Invalid coupon discount' });
            //   }
            const existingCoupon = await couponModel.findOne({ name: { $regex: new RegExp(couponName, 'i') } });
            console.log('👻👻 create coupon in coupon helper.js 👻', existingCoupon ,'👻👻 create coupon in coupon helper.js 👻');

            if (existingCoupon) {
                console.log('Coupon code already exists');
                // return res.status(400).json({ error: 'Coupon code already exists' });
            } else {
                
                //Create a new coupon
                const newCoupon = new couponModel({
                    code:couponCode,
                    name:couponName,
                    discount:couponDiscount,
                    expiryDate:couponExp,
                })

                await newCoupon.save();

                // res.status(201).json({ message: 'Coupon created successfully', coupon:newCoupon })
            }

        } catch (error) {
            console.log(error.message);
            res.status(500).json({ error: 'Server error' });
        }
    }
}