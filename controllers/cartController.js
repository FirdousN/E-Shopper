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
        try {
            if (!req.session.user) {
                // User is not logged in, handle this case accordingly
                return res.render('users/cart', { user: null, total: 0, cartCount: 0, products: [], categories: [], message: 'Please log in to view your cart.' });
            }
            const userId = req.session.user._id;
            let cart = await cartModel.findOne({ userId });

            let categories = await categoryModel.find();

            let products = await cartHelper.getCartProduct(userId);
            let pro = await cartHelper.cartProduct(cart)
            // let total = 0;
    
            if (products.length > 0) {
                const total = await cartHelper.getTotalAmount(pro, products);
                let cartCount = await cartHelper.getCartCount(userId);
                let user = req.session.user;
        
                console.log(cartCount, '💕💕 cartId 💕💕');
                console.log(products, 'Products👍👍');
        
                if (Array.isArray(products) && products.length > 0 || categories.length > 0) {
                    res.render('users/cart', { cart, total, user, cartCount, products, categories });
                }
            }else {
                console.log('/*///////*/*/*/*/*/*//**/ not');
                res.render('users/cart', { user, total: 0, cartCount, products: [], categories: [], message: 'Your cart is empty.' });
            }
    
        } catch (error) {
            console.log(error.message);
            const userId = req.session.user._id;
            let products = await cartHelper.getCartProduct(userId);
            let categories = await categoryModel.find();
            let total = 0; // Add this line to define total
            res.render('users/cart', { products, total, categories });
        }
    
    },

    getAddCart: async (req, res) => {
        console.log('testing getAddCart***');
        console.log("api calling");
        try {
            slug = req.params.slug;
            page = req.params.page;

            console.log('👑page:' , page , '👑page');
            console.log(slug, 'getAddCart slug value testing');

            userId = req.session.user._id
            // console.log(userId, 'testing userId❤️❤️❤️❤️❤️❤️');

            await cartHelper.addToCart(slug, userId,page)
            .then(async () => {
                const cartCount = await cartHelper.getCartCount(userId)
                // console.log(cartCount, '💸💸');
                res.json({ cartCount: cartCount , message :'Product added to cart '})
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
                } else {
                    await cartHelper.addToCart(slug, userId).then(async () => {
                        const cartCount = await cartHelper.getCartCount(userId)
                        console.log(cartCount, '💸💸');
                        res.json({ cartCount: cartCount })
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
            
            let cart = await cartModel.findOne({ userId });
            
            console.log(userId, 'testing ajax in user id 💕💕');
            console.log(proSlug, '❤️testing ajax in product id ❤️');

            const count = req.body.count;

            console.log(count);

            let response = await cartHelper.changeProductQuantity(proSlug, userId, count);
            let products = await cartHelper.getCartProduct(userId) // to find products in userCart
            let pro = await cartHelper.cartProduct(cart)

            let total = 0;
            if (products.length > 0) {
                 total = await cartHelper.getTotalAmount(pro, products);
            }
            console.log(response, "responseeeeeeee");

            res.status(200).send({ total: total, message: 'Product quantity updated successfully' });
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
            let cart = await cartModel.findOne({ userId });
            let pro = await cartHelper.cartProduct(cart)

            await cartHelper.removeProduct(proSlug, userId)
                .then(async (response) => {

                    console.log(response, "👻👻");
                    let products = await cartHelper.getCartProduct(userId) // to find products in userCart
                    // let total = 0;
                    if (products.length > 0) {
                        const total = await cartHelper.getTotalAmount(pro, products);
                    }
                    const cartCount = await cartHelper.getCartCount(userId)
                    res.json({ cartCount: cartCount, removeProduct: response.removeProduct, total })

                });
            ;


        } catch (error) {
            console.log(error.message);
        }
    },




}
