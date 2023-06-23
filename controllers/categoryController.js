const mongoose = require("mongoose");
const categoryModel = require('../models/category-model');
const productModel = require('../models/product-model');
const categoryHelper = require('../helpers/category-helper')

module.exports = {
    getCategoryList: async (req, res) => {
        const catagories = await categoryModel.find()
        res.render('admin/category-List', { admin: true, catagories })
    },

    getAddCategory: (req, res) => {
        let adminDetails = req.session.admin;
        res.render('admin/add-category', { admin: true, adminDetails })
    },

    postAddCategory:async(req, res) => {
        try{
        console.log('post category');
        console.log(req.body, "category");

        let categoryData = {
            category: req.body.category,
            gender: req.body.gender,
            subcategory: req.body.subcategory
        }
        console.log(categoryData, "categoryData1");
        await categoryHelper.addCategory(categoryData)
            .then((response) => {

                res.redirect('/admin/category-List');
            })
            }catch(error){
                console.log(error.message);

                res.redirect('/admin/add-category')
            }

        // res.redirect('/admin/category-List?categories');
    },

    getEditCategory: async (req, res) => {
        console.log('get edit category **********/');
        try {
            const categoryId = req.params.id
            const category = await categoryModel.findById(categoryId)
            console.log(category);
            res.render('admin/edit-category', { admin: true, category })

        } catch (error){
            console.log(error.message);

            res.redirect('/admin/edit-category')
        }
    },

    postEditCategory: (req, res) => {
        console.log(req.params.id, 'post edit category');
        const categoryId = req.params.id;

        console.log(req.body, categoryId);
        categoryHelper.editCategory(categoryId, req.body,).then((resolve) => {

            res.redirect('/admin/category-List')
        })

    },
    

}
