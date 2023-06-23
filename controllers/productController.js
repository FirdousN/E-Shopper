const mongoose = require("mongoose");
const categoryModel = require("../models/category-model")
const productHelpers = require("../helpers/product-helpers");
const productModel = require("../models/product-model")
const slugify = require ('slugify')
// const multer  = require('multer')
// const upload = require('../config/multer');

module.exports = {

    getProducts: async (req, res) => {
        
        let products = await productModel.find()
        // console.log(image.file);
        res.render('admin/products-List', { admin: true, products })

    },

    getAddProducts: (req, res) => {
        // console.log(req.body.category)
        categoryModel.find().then((categories) => {
            console.log(categories);
            const viewsData = {
                edit: true,
                pageTile:" Edit Product"
            };
            // let catagories =categoryModel.find()
            res.render('admin/add-products', { categories, admin: true })

        }).catch((error) => {
            console.log(error)
        })

    },

    postAddProducts: async(req, res) => {

        console.log(req.body, 'body')
        
        const files = req.files
        const images = files.map((file) => {
            return file.filename
        })
        
        let productData = req.body;
        productData.slug = slugify(productData.productName , { lower:true})

        productHelpers.addProduct(productData ,images).then(() => {
            res.redirect('/admin/add-products')
        }).catch((error) => {
            console.log(error.message);
            if (error.message === 'Product already exists') {
                res.redirect('/admin/add-products?error=' + encodeURIComponent('Product already exists'));
              } else {
                res.redirect('/admin/dashboard');
              }
        })
    },

    getEditProducts: async (req, res) => {
        console.log('get edit products');
        try {
            const productId = req.params.id
            const product = await productHelpers.findProduct(productId)
            const categories = await categoryModel.find()
            console.log(product);
            res.render('admin/edit-products', { admin: true, product, categories })
        } catch {
            res.redirect('/admin/products')
        }
    },

    postEditProducts: (req, res) => {
        console.log(req.body,'postEditProducts sample');
        // let files = req.files
        console.log(req.params.id);
        const productId = req.params.id
        // let images
        // if (!files[0]) {
        //     images = false
        // } else {
        //     images = files.map((file) => {
        //         return file.filename
        //     })
        // }
        console.log(req.body,productId);
        // productHelpers.editProducts(productId, req.body, images).then((resolve) => {
            productHelpers.editProducts(productId, req.body).then((resolve) => {

            res.redirect('/admin/products-List')
        })
    },

    //Admin delete products
    postDeleteProduct: async(req, res , next) => {
        try{
            const productId = req.params.id;
            console.log(productId,'kkkkkk');
            
            const products = await productModel.findById(productId);
            if(!products){
                return res.status(404).json({ error: 'Product not found'})
            }
            await productHelpers.DeleteProductId(productId)
            
            // swal.fire ({
            //     icon:"success",
            //     title:"Success",
            //     text:"Product soft deleted",
            // })
            res.redirect('/admin/products-List')
            // res.json({ message:'Product deleted successfully'})
            }catch (error){
                res.status(500).json({ error: 'Failed to delete product'})
            }

        // productHelpers.DeleteProductId(productId)
        //     res.redirect('/admin/products-List')
       
        // productHelpers.deleteProduct(productId).then((result) => {
        //     res.redirect('/products')
        // }).catch((error) => {
        //     res.redirect('/products')
        // })
    },

    getForm : (req, res) => {
        res.render('admin/add-form', { admin: true })
    },

    postForm : (req, res) => {
        console.log(req.body);
        console.log(req.file);
        return res.redirect('/add-form')
    }
}