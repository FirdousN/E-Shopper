const mongoose = require("mongoose");
const categoryModel = require("../models/category-model")
const productHelpers = require("../helpers/product-helpers");
const productModel = require("../models/product-model")
const slugify = require('slugify')
// const multer  = require('multer')
// const upload = require('../config/multer');

module.exports = {


    getProducts: async (req, res) => {
        try {
            let admin = req.session.admin;

            let products = await productModel.find()
            // console.log(image.file);
            res.render('admin/products-List', {admin, admin: true, products })
        } catch (error) {
            console.log(error.message);
        }
    },

    getAddProducts: (req, res) => {
        // console.log(req.body.category)
        try {
            let admin = req.session.admin;

            categoryModel.find().then((categories) => {
                console.log(categories);
                const viewsData = {
                    edit: true,
                    pageTile: " Edit Product"
                };
                // let catagories =categoryModel.find()
                res.render('admin/add-products', {admin ,categories, admin: true })

            })
        } catch (error) {
            console.log(error)
        }

    },

    postAddProducts: async (req, res) => {
        try {
            console.log(req.body, 'body')
    
            const files = req.files;
            const images = files.map((file) => {
                return file.filename;
            });
            let category_id = req.body.category_id; // Access the selected category_id from req.body
            
            console.log(category_id,'000000000000001🧛🏻');
            let productData = req.body;
            productData.slug = slugify(productData.productName, { lower: true });
    
            productHelpers.addProduct(productData, category_id, images).then(() => {
                res.redirect('/admin/add-products');
            });
    
        } catch (error) {
            console.log(error.message);
            if (error.message === 'Product already exists') {
                res.redirect('/admin/add-products?error=' + encodeURIComponent('Product already exists'));
            } else {
                res.redirect('/admin/dashboard');
            }
        }
    },

    getEditProducts: async (req, res) => {
        console.log('get edit products');
        try {
            let admin = req.session.admin;
            const proSlug = req.params.slug
            const product = await productHelpers.findProduct(proSlug)
            const categories = await categoryModel.find()
            console.log(product);
            res.render('admin/edit-products', {admin , admin: true, product, categories })
        } catch {
            res.redirect('/admin/products')
        }
    },

    postEditProducts: (req, res) => {
        try {
            console.log(req.body, 'postEditProducts sample');
            // console.log(req.params.id);

            let files = req.files;
            const productId = req.params.id
            let images = []

            console.log(files, '💸 images 💸');

            if (files && files.length > 0) {
                images = files.map((file) => {
                    return file.filename;
                })

            }
            // console.log('🌹🌹', req.body, '🌹🌹', productId, '🌹🌹', images, '🌹🌹');

            productHelpers.editProducts(productId, req.body, images).then((resolve) => {

                res.redirect('/admin/products-List')
            })

        } catch (error) {
            console.log(error.message);
        }

    },

    //Admin delete products
    postDeleteProduct: async (req, res, next) => {
        try {
            const productId = req.params.id; // Update the parameter name to `id`
            console.log(productId, 'productId');

            const product = await productModel.findById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            await productHelpers.deleteProductById(productId); // Update the function name to `deleteProductById`

            res.status(200).json({ success: true });

            // res.redirect('/admin/products-List');
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            res.status(500).json({ error: 'Failed to delete product' });
        }
    },

}