const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const adminHelper = require('../helpers/admin-helper');
const session = require('express-session');
const adminModel = require('../models/admin-model');
// const productModel = require('../models/product-model');



module.exports = {

    getDashbord: async (req, res) => {
        if (req.session.admin) {
            res.render('admin/dashbord', { admin: true })
        } else {
            res.redirect('/admin/admin-login')
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
            }catch(error){
                console.log("Incorrect Email or Password...!!!");
                let errorMessage = 'Incorrect Email or Password....!!!';
                res.redirect('/admin/admin-login?error=' + errorMessage);
            }
        
    },

    getLogout: (req, res) => {
        req.session.destroy(); // Destroy the session
        res.redirect('/admin-login')
    },

    getUsersList: async (req, res) => {
        try {
            const users = await adminHelper.getAllUsers()
            res.render('admin/users-List', { admin: true, users })
        } catch (error) {
            console.error(error)
            res.render('admin/erro-view', { admin: true, error: 'An error occurred' })
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

    // insertUser: async (req, res) => {
    //     try {
    //         const user = new User({
    //             name: req.body.name,
    //             email: req.body.email,
    //             mobile: req.body.mobile,
    //             image: req.file.filname,
    //             is_admin: 0,
    //         });
    //         const userData = await user.save();

    //         if (userData) {
    //             res.render('admin/registration', { message: "Your registration has been successfully" })
    //         } else {
    //             res.render('admin/registration', { message: "Your registration has been failed" })
    //         }

    //     } catch (error) {
    //         console.log(error.message)
    //     }
    // },

    // loadRegister: async (req, res) => {
    //     try {
    //         res.render('admin/registration', { admin: true })

    //     } catch (error) {
    //         console.log(error.message);
    //     }
    // },
    ///**********************Admin products************************* */ 
   


}
