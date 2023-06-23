const mongoose = require('mongoose');
const userModel = require ('../models/userModel')
const cartModel = require('../models/cart-model');
const productModel = require('../models/product-model');
const cartHelper = require('../helpers/cart-helper')
const slugify = require('slugify')
const { ObjectId } = require('mongoose');
const ordersHelper = require('../helpers/orders-helper');


module.exports = {
    getCart: async (req, res) => {

        const userId = req.session.user._id;
        let products = await cartHelper.getCartProduct(userId) // to find products in userCart
        let total =0;
        if(products.length > 0){
            total = await cartHelper.getTotalAmount(products)// to get total products amount & price
        }
        let cartCount = await cartHelper.getCartCount(req.session.user._id) // to cart product count
        
        try {
            
            let user = req.session.user;
            let cart = await cartModel.findOne({ userId })

            console.log(cart._id, '💕💕 cartId 💕💕');
            console.log(products, 'Products👍👍');

            if (Array.isArray(products) && products.length > 0) {
                res.render('users/cart', { cart, total, user, cartCount, products });
            } else {
                console.log('/*///////*/*/*/*/*/*//**/ not');
                res.render('users/cart', { user,total, cartCount, products: [],message: 'Your cart is empty.'  });            }
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
            slug = req.params.id;
            console.log(slug, 'getAddCart slug value testing');
            userId = req.session.user._id
            console.log(userId, 'testing userId❤️❤️❤️❤️❤️❤️');

            await cartHelper.addToCart(slug, userId).then(() => {
                res.redirect('/shop')
            })

        } catch (error) {
            console.log(error.message)
        }
    },

    cartCount: async (req, res) => {
        try {
            let userId = req.session.user._id
            let cartCount = 0;

            if (user) {
                const cart = await cartModel.findOne(userId)
                if (cart) {
                    cartCount = cartModel.products.reduce(
                        (acc, products) => acc + products.quantity,
                        0
                    )
                };

            }
            req.cartCount = cartCount;
            next();
        } catch (error) {
            console.log(error.message)
        }
    },
    postProductQuantity: async (req, res, next) => {
        try {
            const proSlug = req.params.slug;
            const userId = req.session.user._id

            console.log(userId, 'testing ajax in user id 💕💕');
            console.log(proSlug, 'testing ajax in product id ❤️');

            const count = req.body.count;

            console.log(count);

            await cartHelper.changeProductQuantity(proSlug, userId, count);

            res.status(200).send('Product quantity updated successfully');
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
            await cartHelper.removeProduct(proSlug, userId).then((response) => {
                res.json(response)

            });

        } catch (error) {
            console.log(error.message);
        }
    },

    


}
