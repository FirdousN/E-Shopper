const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
const userHelper = require('../helpers/user-helper');
const cartHelper = require('../helpers/cart-helper');
const userModel = require('../models/userModel');
const productModel = require("../models/product-model")
const session = require('express-session');
// require twilio
const twilioFunctions = require("../config/twilio");
const accountSid = "ACa69eeeb875a9c5d2437af10c2302a19f";
const authToken = "570c296f42954c018df0e025f4a42427";
const verifySid = "VAa9e8cbd885f5c057ff4a1e44efbc3c41";
const client = require("twilio")(accountSid, authToken);
const slugify = require('slugify');
const categoryModel = require("../models/category-model");
const bannerModel = require('../models/banner-model');
const productHelpers = require("../helpers/product-helpers");
const cartModel = require ("../models/cart-model")
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require("twilio")(accountSid, authToken);

module.exports = {

    getHome: async (req, res, next) => {
        let user = req.session.user;
        let categories = await categoryModel.find()
        let banners = await bannerModel.find();
        console.log(categories, '💸💸 categories 💸💸');
        if (req.session.user) {
            console.log('////////////////');
            let cartCount = await cartHelper.getCartCount(req.session.user._id)
            console.log(cartCount, 'cartCount 🌹');
            console.log(user);

            let categories = await categoryModel.find()
            console.log(categories, '💸💸 categories 💸💸');

            res.render('users/index', { banners, categories, user, cartCount, title: "Home Page" });
        } else {

            res.render('users/index', { banners, categories, user: null, title: "Home Page" });
        }
    },



    // ***************************************************LOGIN*************************************************
    getSignup: (req, res) => {
        if (req.session.user) {
            res.redirect('/')
        } else {
            let error = req.query.error
            res.render('users/signup', { error, noShow: true })
        }
    },

    postSignup: (req, res) => {
        try {
            console.log(req.body);
            userHelper.doSignup(req.body)
                .then((response) => {

                    // req.session.user = response.user
                    res.redirect('/login')
                })
        } catch (error) {
            console.log('|', error.message, '|', typeof error.message, 'postSignup error message');


            if (error.message == 'Email and mobile number already exist') {

                const exist = 'User already registered';
                const phoneError = error.message
                console.log(phoneError, 'phoneError');
                // res.render('user/signup', { exist: exist,phoneError, noShow: true })
                res.redirect('/signup?error=' + encodeURIComponent(phoneError));
            } else if (error.message === 'Password must contain at least 8 characters, including uppercase and lowercase letters, numbers, and special characters') {
                const passwordError = 'Password must contain at least 8 characters, including uppercase and lowercase letters, numbers, and special characters';
                res.redirect('/signup?error=' + encodeURIComponent(passwordError));
            } else if (error.message === 'No User Found! please create a account') {

            } else {
                res.redirect('/login?error=' + encodeURIComponent(error.message));
            }

        }
    },

    getLogin: (req, res) => {

        if (req.session.user) {
            res.redirect('/')
        }
        else {
            res.render('users/login', { noShow: true })

        }
    },

    postLogin: async (req, res) => {
        try {
            const userData = req.body;
            console.log('postLogin', userData);

            const response = await userHelper.userLogin(userData)
            // .then((response) => {
            if (response.status && response.user) {
                console.log("postLogin if-1");
                req.session.user = response.user
                res.redirect('/');
            } else {
                console.log("postLogin else-1");
                const invalid = response.message;
                res.render('users/login', { noShow: true, invalid })
            }
            // })
        } catch (error) {
            console.log("postLogin catch-1");
            console.log(error.message);

            const invalid = 'An error occurred during login. Please try again later.';
            res.render('users/login', { invalid: invalid });
        }

    },

    getLogout: (req, res) => {
        req.session.destroy(); // Destroy the session
        res.redirect('/login',)
    },

    // otp
    getOtpLogin: (req, res) => {
        res.render("users/otp-login", { noShow: true });
    },

    getOtpSend: (req, res) => {
        res.render("users/verify-otp", { noShow: true });
    },

    generateOtp: (req, res) => {
        try {
            console.log(req.body, '/////////////////phonenumber');
            userHelper.generateOtp(req.body.phonenumber).then((response) => {
                if (response.status) {
                    console.log('generateOtp',);
                    const msg1 = "OTP SENT!!";
                    res.render("users/verify-otp", {
                        msg1,
                        phonenumber: req.body.phonenumber,
                    });
                } else {
                    const error = 'No User Found! please create a account';
                    res.redirect('/signup?error=' + encodeURIComponent(error));
                    res.redirect("/signup");
                }
            });
        } catch (error) {
            console.log(error.message);
        }


    },

    verifyOtp: async (req, res) => {
        try {
            const phonenumber = req.body.phonenumber;
            console.log(phonenumber, 'verifyOpt///////////////');
            const otp = req.body.otpValues;
            console.log(otp);
            client.verify.v2
                .services(verifySid)
                .verificationChecks.create({ to: `+91${phonenumber}`, code: otp })
                .then(async (verificationChecks) => {
                    console.log(verificationChecks, phonenumber);
                    if (verificationChecks.status === "approved") {
                        console.log('verifyOtp if-1');
                        const phone = phonenumber
                        let user = await userModel.findOne({ mobile: phone });
                        console.log(user);
                        if (user.status == false) {
                            console.log('verifyOtp if-2');
                            let blockmsg = "Account is blocked...Unable to login";
                            res.render("users/login", { noShow: true, blockmsg });
                        } else {
                            console.log('verifyOtp else-1');
                            req.session.login = true;
                            req.session.user = user;
                            res.redirect("/");
                        }
                    } else {
                        console.log('verifyOtp else-2');
                        const msg2 = "INCORRECT OTP!!";
                        res.render("users/verify-otp", { msg2: msg2, phonenumber });
                    }
                })
                .catch((error) => {
                    console.log('verifyOtp catch-1');
                    console.error(error);
                    res.render("catchError", {
                        message: error.message,
                    });
                });
        } catch (err) {
            console.log('verifyOtp catch-2');
            console.error(err);
            res.render("catchError", {
                message: err.message,
            });
        }
    },

    resendOtp: (req, res) => {
        let phonenumber = req.query.mobile;
        console.log(phone);
        twilioFunctions.generateOTP(phonenumber);
    },

    // otp
    getShop: async (req, res) => {
        const products = await productModel.find({ deleted: false });
        // const categories = await categoryModel.find();

        console.log(products, "Shopping ❤️❤️");

        let user = req.session.user;
        let cartCount = 0;

        if (user) {
            cartCount = await cartHelper.getCartCount({ _id: user._id });
        }

        if (!user || !cartCount || !products) {
            res.render('users/shop', { cartCount: [], products });
        } else {
            res.render('users/shop', { user, cartCount, products });
        }
    },

    shopDetail: async (req, res) => {
        try {
            let slug = req.query.id;
            let orderId = req.query.orderId;

            console.log(orderId, '💸💸💸💸💸');
            console.log(slug, 'slug sample');

            const products = await productModel.findOne({ slug })
            console.log(slug);
            console.log(products, '46565646465[******]');

            if (!products) {
                return res.status(404).send('Product not found');
            }
            console.log(products);

            let user = req.session.user;

            const userId = req.session.user._id;
            let cart = await cartModel.findOne({ userId })

            let cartCount = await cartHelper.getCartCount(req.session.user._id)

            res.render('users/detail', { cart,user, cartCount, products })
        } catch (error) {
            res.status(500).send('Internal Server Error');

            console.log(error.message)
        }
    },

    getCartSample: (req, res) => {

        res.render('users/cart-sample',)
    },

    getError: (req, res) => {

        res.render('users/errorPage', { layout: false })
    },

    getProductsByCategory: async (req, res) => {
        try {
            const categoryName = req.params.category;
            const category = await categoryModel.findOne({ category: categoryName });
            console.log(category, 'category');

            let user = req.session.user;
            let cartCount = 0;

            if (user) {
                cartCount = await cartHelper.getCartCount({ _id: user._id });
            }
            let products = await productHelpers.categoryOfProduct(categoryName)

            console.log(products, '👻👻👻👻');

            res.render('users/shop', { products });
        } catch (error) {
            console.log(error.message);
        }

    },
    getFilteredProducts:async(req,res)=>{
        try {
            const { priceFilters, categoryFilters } = req.body
            // Sample code:
            const products = await productModel.find({
                deleted: false,
                productPrice: { $in: priceFilters },
                category: { $in: categoryFilters }
            });

            // After getting filtered products, render the products template and send it back to the client
            res.render('users/products', { products });
            // Note: You may need to create a separate products.ejs file to display filtered products.


        } catch (error) {
            console.log(error.message);
        }
    }

}