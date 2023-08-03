const mongoose = require('mongoose');
const userModel = require('../models/userModel')
const cartModel = require('../models/cart-model');
const productModel = require('../models/product-model');
const cartHelper = require('../helpers/cart-helper')
const slugify = require('slugify')
const { ObjectId } = require('mongoose');
const ordersHelper = require('../helpers/orders-helper');
const categoryModel = require("../models/category-model");


module.exports = {
    getCart: async (req, res) => {

        const userId = req.session.user._id;
        let products = await cartHelper.getCartProduct(userId) // to find products in userCart
        let pro = await productModel.find()
        let total = 0;
        if (products.length > 0) {
            total = await cartHelper.getTotalAmount(pro,products)// to get total products amount & price
        }
        let cartCount = await cartHelper.getCartCount(req.session.user._id) // to cart product count

        try {

            let user = req.session.user;
            let cart = await cartModel.findOne({ userId })
            let categories = await categoryModel.find()

            console.log(cart._id, '💕💕 cartId 💕💕');
            console.log(products, 'Products👍👍');

            if (Array.isArray(products) && products.length > 0 || categories) {
                res.render('users/cart', { cart, total, user, cartCount, products  , categories});
            } else {
                console.log('/*///////*/*/*/*/*/*//**/ not');
                res.render('users/cart', { user, total, cartCount, products: [] , categories:[], message: 'Your cart is empty.' });
            }
        } catch (error) {
            console.log(error.message);
            const userId = req.session.user._id;

            let products = await cartHelper.getCartProduct(userId)
            res.render('users/cart', { products, total });
        }
    },


    getAddCart: async (req, res) => {
        console.log('testing getAddCart***');
        console.log("api calling");
        try {
            slug = req.params.slug;
            console.log(slug, 'getAddCart slug value testing');
            userId = req.session.user._id
            console.log(userId, 'testing userId❤️❤️❤️❤️❤️❤️');

            await cartHelper.addToCart(slug, userId).then(async() => {
                const cartCount = await cartHelper.getCartCount(userId)
               console.log(cartCount,'💸💸');
                res.json({ cartCount: cartCount})
                // res.redirect('/shop')
            })
            
        } catch (error) {
            console.log(error.message)
        }
    },

    cartCount: async (req, res) => {
        try {
            let userId = req.session.user._id;

            const cart = await cartModel.findOne(userId)
            let cartCount = 0;

            if (user) {
                if (cart) {
                    cartCount = cartModel.products.reduce(
                        (acc, products) => acc + products.quantity,
                        0
                    )
                }else{
                    await cartHelper.addToCart(slug, userId).then(async() => {
                        const cartCount = await cartHelper.getCartCount(userId)
                       console.log(cartCount,'💸💸');
                        res.json({ cartCount: cartCount})
                        // res.redirect('/shop')
                    })
                }

            }
            res.json({ count: cartCount });
            // next();
        } catch (error) {
            console.log(error.message)
            res.status(500).send('Error retrieving cart count');

        }
    },
    postProductQuantity: async (req, res, next) => {
        try {
            const proSlug = req.params.slug;
            const userId = req.session.user._id
         
            console.log(userId, 'testing ajax in user id 💕💕');
            console.log(proSlug, '❤️testing ajax in product id ❤️'); 

            const count = req.body.count;

            console.log(count);

            let response = await cartHelper.changeProductQuantity(proSlug, userId, count);
            let products = await cartHelper.getCartProduct(userId) // to find products in userCart
            let total = 0;
            if (products.length > 0) {
                total = await cartHelper.getTotalAmount(products)// to get total products amount & price
            }
            console.log(response, "responseeeeeeee");

            res.status(200).send({total:total,message:'Product quantity updated successfully'});
        } catch (error) {
            console.log(error.message)
            res.status(500).send('Error updating product quantity');

        }
    },
    removeCartProduct: async (req, res) => {
        try {

            const proSlug = req.params.slug;
            console.log(proSlug, '👍proSlug in remove cart product👍');
            const userId = req.session.user._id;
            await cartHelper.removeProduct(proSlug, userId)
            .then(async(response) => {
                
                console.log(response, "👻👻");
                let products = await cartHelper.getCartProduct(userId) // to find products in userCart
                let total = 0;
                if (products.length > 0) {
                    total = await cartHelper.getTotalAmount(products)// to get total products amount & price
                }
                const cartCount = await cartHelper.getCartCount(userId)
                res.json({ cartCount: cartCount , removeProduct:response.removeProduct , total })

            });
          ;


        } catch (error) {
            console.log(error.message);
        }
    },




}
