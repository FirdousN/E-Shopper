const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
const userModel = require('../models/userModel');
const userHelper = require('../helpers/user-helper');
const cartHelper = require('../helpers/cart-helper');
const productModel = require("../models/product-model")
const session = require('express-session');
// const slugify = require('slugify');
const categoryModel = require("../models/category-model");
const bannerModel = require('../models/banner-model');
const productHelpers = require("../helpers/product-helpers");
const cartModel = require("../models/cart-model")
// require twilio
const twilioFunctions = require("../config/twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;
const client = require("twilio")(accountSid, authToken);

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
        try {
            if (req.session.user) {
                res.redirect('/')
            } else {
                let error = req.query.error
                res.render('users/signup', { error, })
            }
        } catch (error) {
            error.message
        }

    },

    postSignup: async (req, res) => {
        try {
            let userData = req.body;
            console.log(userData, 'userData');

            let result = await userHelper.userSignup(userData)
            console.log(result, 'result');

            res.redirect('/login')
        } catch (error) {
            console.log(error.message);
            if (error.message == 'Email and mobile number already exist') {

                const exist = 'User already registered';
                const phoneError = error.message
                console.log(phoneError, 'phoneError');
                // res.render('user/signup', { exist: exist,phoneError, noShow: true })
                res.redirect('/signup?error=' + encodeURIComponent(phoneError));
            } else if (error.message === 'Password must contain at least 8 characters, including uppercase and lowercase letters, numbers, and special characters') {
                const passwordError = 'Password must contain at least 8 characters, including uppercase and lowercase letters, numbers, and special characters';
                res.redirect('/signup?error=' + encodeURIComponent(passwordError));
            }
            else {

                res.redirect('/signup?error=' + encodeURIComponent(error.message));
            }

        }
    },
    

    getLogin: async(req, res) => {
        try {
          if (req.session.user) {
            res.redirect('/');
          } else {

            const error = req.session.error; // Get the error message from the session
            res.render('users/login', { error ,noShow: true}); // Pass the error variable to the login page
            req.session.error = null; // Clear the error message from the session after rendering the page
          }
        } catch (error) {
          console.log(error.message);
        }
    },      

    postLogin: async (req, res) => {
        try {
            const userData = req.body;
            console.log('postLogin', userData);
            let categories = await categoryModel.find();
    
            const response = await userHelper.userLogin(req.body);
    
            if (response.status && response.user) {
                console.log("postLogin if-1");
                req.session.user = response.user;
                req.session.categories = categories; // Store categories in the session
                res.redirect('/');
            } else {
                console.log("postLogin else-1");
                req.session.error = response.message; // Store the error message in session
                res.redirect('/login');
            }
        } catch (error) {
            console.log("postLogin catch-1");
            console.log(error.message);
    
            const invalid = 'An error occurred during login. Please try again later.';
            req.session.error = invalid;
            res.redirect('/login?error=' + encodeURIComponent(invalid));
        }
    },
        

    getLogout: async (req, res) => {
        try {
            req.session.destroy(); // Destroy the session
            res.redirect('/login');
        } catch (error) {
            console.log(error.message);
        }

    },

    // otp
    getOtpLogin:async(req, res) => {
        try {
            res.render("users/otp-login", { noShow: true });
        } catch (error) {
            console.log(error.message);
        }
    },

    getOtpSend: async(req, res) => {
        res.render("users/verify-otp", { noShow: true });
    },

    generateOtp:async (req, res)=> {
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

    resendOtp:async (req, res) => {
        try {
            let phonenumber = req.query.mobile;
            console.log(phone);
            twilioFunctions.generateOTP(phonenumber);
        
        } catch (error) {
            console.log(error.message);
        }
    },    

    // otp
    getShop: async (req, res) => {
        try {
            const products = await productModel.find({ deleted: false }).exec();;
            console.log(products, "Shopping ❤️❤️");

            let categories = await categoryModel.find();
            console.log(categories, '🧛🏻🧛🏻');
            console.log('Number of categories:', categories.length);

            let user = req.session.user;
            let cartCount = 0;

            if (user) {
                cartCount = await cartHelper.getCartCount({ _id: user._id });
            }

            if (!user || !cartCount || !products || !categories) {
                res.render('users/shop', { cartCount: [], products, categories: [] });
            } else {
                res.render('users/shop', { user, cartCount, products, categories });
            }
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ error: 'Internal Server Error' });
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

            res.render('users/detail', { cart, user, cartCount, products })
        } catch (error) {
            res.status(500).send('Internal Server Error');

            console.log(error.message)
        }
    },

    getCartSample:async (req, res)=> {
        try {
            res.render('users/cart-sample',)
        } catch (error) {
            console.log(error.message);
        }
    },

    getError:async (req, res) => {
        try {
            res.render('/error', { layout: false })
        } catch (error) {
            console.log(error.message);
        }
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
            let categories = await categoryModel.find();
            console.log(categories, '🧛🏻🧛🏻');

            res.render('users/shop', { categories, products });
        } catch (error) {
            console.log(error.message);
        }

    },
    getFilteredProducts: async (req, res) => {
        try {
            const priceFilters = req.body.priceFilters || [];
            const categoryFilters = req.body.categoryFilters || [];

            // Debugging statements
            console.log('Price Filters:', priceFilters);
            console.log('Category Filters:', categoryFilters);

            let query = productModel.find({});
            console.log('❤️Original Query:', query, '❤️');

            let products = []; // Change from "const" to "let"

            if (priceFilters.length > 0) {
                const priceRanges = await productHelpers.getPriceRanges(priceFilters);
                console.log('Price Ranges:', priceRanges);

                let pipeline = [
                    {
                        $match: {
                            productPrice: { $gte: priceRanges[0], $lte: priceRanges[1] }
                        }
                    }
                ];
                products = await productModel.aggregate(pipeline);

            }
            if (categoryFilters.length > 0) {
                console.log('❤️categoryFilter', categoryFilters, '❤️');
                let pipeline = [
                    {
                        $match: {
                            category: { $in: categoryFilters }
                        }
                    }
                ];
                products = await productModel.aggregate(pipeline);
            }

            console.log('🧛🏻', { products }, '🧛🏻');
            return res.json({ products });
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },


}