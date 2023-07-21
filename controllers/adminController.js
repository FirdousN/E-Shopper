const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const adminHelper = require('../helpers/admin-helper');
const session = require('express-session');
const adminModel = require('../models/admin-model');
const ordersModel = require('../models/order-model');
const userModel = require("../models/userModel");
const { ObjectId } = require('mongodb');
const categoryModel = require('../models/category-model');
const ordersHelper = require("../helpers/orders-helper");
const categoryHelper = require("../helpers/category-helper");


module.exports = {

    getDashboard: async (req, res) => {
        try {
            if (req.session.admin) {
                console.log('getDashboard');
                const users = await userModel.find();
                const orders = await ordersModel.find({})
                    .populate({
                        path: 'products.item',
                        model: 'Product'
                    }).exec();
                console.log(orders, '👻👻👻👻👻');

                // Total Sales of each orders.
                const totalSales = orders.reduce((accumulator, order) => {
                    order.products.forEach((product) => {
                        if (product.deliveryStatus === 'payed' && product.orderStatus === 'deliver') {
                            accumulator = accumulator + product.quantity
                        }
                    })
                    return accumulator;
                }, 0);
                console.log(totalSales, '👻👻');

                // Total ordered products of each order 
                const totalOrders = orders.reduce((accumulator, order) => {
                    order.products.forEach((product) => {

                        accumulator = accumulator + product.quantity

                    })
                    return accumulator;
                }, 0);
                console.log(totalOrders, '👻👻');

                //Total payed  in total orders of products
                const totalPayed = orders.reduce((accumulator, order) => {
                    order.products.forEach((product) => {
                        if (product.deliveryStatus === 'payed') {
                            accumulator = accumulator + product.price * product.quantity;
                        }
                    });
                    return accumulator;
                }, 0);

                console.log(totalPayed, '👻totalPayed👻');

                // const totalCancelled = orders.reduce((accumulator, order) => {
                //     order.products.forEach((product) => {
                //         if (product.orderStatus === 'cancel') {
                //             accumulator += 1;
                //         }
                //     });
                //     return accumulator;
                // }, 0);
                // console.log(totalCancelled, '👻👻');
                const monthlyRevenue = await adminHelper.calculateMonthlyRevenue(orders);
                const AnnualRevenues = await adminHelper.calculateAnnualRevenue(orders);


                let categories = await categoryModel.find()
                let deliverCategory = await categoryHelper.deliverCategory()
                console.log(deliverCategory,'👻👻deliverCategory👻👻');
                // const categoryData = await adminHelper.categoryOrderData(orders, categories);

                const startOfYear = new Date(new Date().getFullYear(), 0, 1); // start of the year
                const endOfYear = new Date(new Date().getFullYear(), 11, 31); // end of the year
              
                console.log('❤️❤️', monthlyRevenue, '❤️❤️', AnnualRevenues, '❤️❤️');
                console.log('❤️❤️', categories, '❤️❤️');
                
                
                res.render('admin/dashboard',{
                    totalSales,
                    totalPayed, 
                    orders, 
                    totalOrders, 
                    users, 
                    admin: true ,
                    monthlyRevenue,
                    categories,
                    AnnualRevenues,
                    deliverCategory
                });
            
            } else {
                res.redirect('/admin/admin-login')
            }
        } catch (error) {
            console.log(error.message);
        }
    },

    getLogin: (req, res) => {
        if (req.session.admin) {
            res.redirect('/admin')
        } else {
            const errorMessage = req.query.error;
            res.render('admin/admin-Login', { error: errorMessage, noShow: true, admin: true })
        }
        console.log("get admin-login ")

    },

    postLogin: (req, res) => {
        try {
            console.log(req.body);
            adminHelper.adminLogin(req.body)
                .then((response) => {
                    req.session.admin = response.admin;
                    res.redirect('/admin')
                })
        } catch (error) {
            console.log("Incorrect Email or Password...!!!");
            let errorMessage = 'Incorrect Email or Password....!!!';
            res.redirect('/admin/admin-login?error=' + errorMessage);
        }

    },

    getLogout: (req, res) => {
        try {
            req.session.destroy(); // Destroy the session
            res.redirect('/admin-login')
        } catch (error) {
            console.log(error.message);
        }
    },

    getUsersList: async (req, res) => {
        try {
            const users = await adminHelper.getAllUsers()
            res.render('admin/users-List', { admin: true, users })
        } catch (error) {
            console.error(error)
            res.render('admin/error-view', { admin: true, error: 'An error occurred' })
        }

    },

    blockUser: async (req, res, next) => {

        try {
            const id = req.params.id;

            adminHelper.blockUser(id).then((response) => {
                res.status(202).json(response)
            })
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' })
        }


    },

    // unblockUser:async (req,res)=>{
    //     const userId = req.body.userId;
    //     try{
    //         await adminHelper.unblockUser(userId);
    //         console.log('redirect users-List page in unblock');
    //         res.redirect('/admin/users-List');
    //     } catch(error){
    //         console.log('render  error page');
    //         console.error(error);
    //         res.render('admin/error-view', {admin:true , error:'An error occurred'})
    //     }
    // },
   
    ///**********************Admin products************************* */ 



}
