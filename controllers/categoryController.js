const mongoose = require("mongoose");
const categoryModel = require('../models/category-model');
const productModel = require('../models/product-model');
const categoryHelper = require('../helpers/category-helper')
const slugify = require('slugify'); 
const productHelpers = require("../helpers/product-helpers");

module.exports = {
    getCategoryList: async (req, res) => {
        const catagories = await categoryModel.find()
        res.render('admin/category-List', { admin: true, catagories })
    },

    getAddCategory: (req, res) => {
        let adminDetails = req.session.admin;
        const viewsData = {
            edit: true,
            pageTile: "Edit Category"
        }
        const error = req.query.error; // Assuming the error message is passed in the query string
        res.render('admin/add-category', { error, admin: true, adminDetails })
    },

    postAddCategory: async (req, res) => {
        try {
          console.log('post category');
          console.log(req.body, "category");
      
          const files = req.files;
          const images = files.map((file) => {
            return file.filename;
          });
          let categoryData = req.body;
          console.log(categoryData);
          
          const slug = slugify(categoryData.category, { lower: true });
          categoryData.slug = slug;
          
          await categoryHelper.addCategory(categoryData, images).then(() => {
            res.redirect('/admin/add-category');
          });
      
          console.log(categoryData, "categoryData1");
        } catch (error) {
          console.log(error.message);
          if (error.message === 'Category already exists') {
            res.redirect('/admin/add-category?error=' + encodeURIComponent('Category already exists'));
          } else {
            res.redirect('/admin/category-List');
          }
        }
      },
      

    getEditCategory: async (req, res) => {
        console.log('get edit category **********/');
        try {
            const categoryId = req.params.id
            const category = await categoryModel.findById(categoryId)
            console.log(category);
            res.render('admin/edit-category', { admin: true, category })

        } catch (error) {
            console.log(error.message);

            res.redirect('/admin/edit-category')
        }
    },

    postEditCategory: (req, res) => {
        try {
            console.log(req.params.id, 'post edit category');

            const categoryId = req.params.id;
            let files = req.files;
            let images = [];
            console.log(files , '💸 images 💸');

            if(files && files.length > 0){
                images = files.map((file)=>{
                    return file.filename;
                })
            }

            console.log('🌹🌹' ,req.body,'🌹🌹', categoryId ,'🌹🌹', images , '🌹🌹');
            
            categoryHelper.editCategory(categoryId, req.body, images).then((resolve) => {

                res.redirect('/admin/category-List')
            })
        } catch (error) {
            console.log(error.message);
        }
    },

}
