const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const ordersHelper = require("../helpers/orders-helper");
const session = require('express-session');
const addressModel = require('../models/address-model');
const addressHelper = require("../helpers/address-helper");
const userHelper = require("../helpers/user-helper");
const categoryModel = require("../models/category-model");

// const productModel = require('../models/product-model');

module.exports = {
    getUserProfile:async(req,res)=>{
        console.log('USER PROFILE');
        try {
            let categories = await categoryModel.find()

            let user = req.session.user;
            console.log(user, '😷');
            res.render('users/user-profile',{user ,categories})
        } catch (error) {
            console.log(error.message);
        }
    },
    getUserAddress:async(req,res)=>{
        console.log('USER ADDRESS');
        try {
            let categories = await categoryModel.find()

            let user = req.session.user;
            console.log(user , '😁👌');
            
            let userData = await ordersHelper.userAddress({_id:user._id});
            console.log(userData , '👌userData👌');
            res.render('users/user-address' , {user ,categories})
        } catch (error) {
            console.log(error.message);
        }
    },
    getEditAddress:async(req,res)=>{
        try {
            let user = req.session.user;
            let addressId = req.params.addressId;
            let categories = await categoryModel.find()

            console.log(addressId,'❤️ address Id ❤️');
            let address = await addressHelper.findAddress(user._id ,addressId)
            console.log(address , 'address showing in address controller');
            res.render('users/edit-address',{user ,address ,categories})

        } catch (error) {
            console.log(error.message);
        }
    },

    postEditAddress: async (req, res) => {
        try {
            console.log(req.body, '❤️');
    
            const userId = req.session.user._id;
            const addressId = req.body.addressId;
            const updatedAddress = {
                street: req.body.street,
                city: req.body.city,
                state: req.body.state,
                country: req.body.country,
                pincode: req.body.pincode
            };
    
            await addressHelper.editAddress(userId, addressId, updatedAddress);
    
            res.redirect('/user-address');
        } catch (error) {
            console.log(error.message);
        }
    },
    getAddAddress:async(req,res)=>{
        try {
            let user =req.session.user;
            let categories = await categoryModel.find()

            res.render('users/add-userAddress',{user , categories})
        } catch (error) {
            console.log(error.message);
        }
    },
    postAddAddress:async(req,res)=>{
        try {
            let user = req.session.user;
            console.log('💸💸',req.body,'💸💸');
            await addressHelper.addAddress(req.body, user._id)
            res.redirect('/user-address')
        } catch (error) {
            console.log(error.message);
        }
    },
    deleteAddress:async(req,res)=>{
        try {
            let userId = req.session.user._id
            console.log(userId);
            // let user = await userHelper.findUser
            let addressId = req.params.addressId;

            console.log(addressId);

            
        } catch (error) {
            console.log(error.message);
        }
    }

}
