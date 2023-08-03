const mongoose = require('mongoose');
const productModel = require('../models/product-model');
const couponModel = require('../models/coupon-model');
const { ObjectId } = require('mongodb');


module.exports = {
    getCoupons: async () => {
        try {
          const coupons = await couponModel.find();
          return coupons;
        } catch (error) {
          throw new Error(error.message);
        }
      },

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

    createCoupon: async ( couponsData,couponCode, res) => {
        try {
            
            let couponName = couponsData.name;
            let couponDiscount = couponsData.discount;
            let couponExp = couponsData.expiryDate;
            let couponMinPrice = couponsData.minPrice;
            let couponMaxPrice = couponsData.maxPrice;


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
                    minPrice:couponMinPrice,
                    maxPrice:couponMaxPrice,
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
    },
    
    editCoupon: async (couponData, couponId) => {
        try {
          console.log(couponData, couponId, 'edit coupon helper');
      
          const existingCoupon = await couponModel.findOne({ _id: couponId });
         console.log( existingCoupon,'existingCoupon');
          let couponName = couponData.name;
          let couponDiscount = couponData.discount;
          let couponExp = couponData.expiryDate;
          let couponMinPrice = couponData.minPrice;
          let couponMaxPrice = couponData.maxPrice;
      
          let couponCode = existingCoupon.code; // Preserve the existing code if the name is not updated
          if (existingCoupon.name !== couponName) {
            couponCode = await couponHelper.generateCouponCode(couponName, new Date(couponExp));
          }
      
        let newCoupon = await couponModel.updateOne({ _id: couponId }, {
            $set: {
              code: couponCode,
              name: couponName,
              minPrice: couponMinPrice,
              maxPrice: couponMaxPrice,
              discount: couponDiscount,
              expiryDate: couponExp,
            }
          });
          await newCoupon.save();

          console.log('edit coupon success');
        } catch (error) {
          console.log(error.message);
        }
      }
}