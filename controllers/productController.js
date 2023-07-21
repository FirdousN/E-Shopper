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
            let products = await productModel.find()
            // console.log(image.file);
            res.render('admin/products-List', { admin: true, products })
        } catch (error) {
            console.log(error.message);
        }
    },

    getAddProducts: (req, res) => {
        // console.log(req.body.category)
        try {
            categoryModel.find().then((categories) => {
                console.log(categories);
                const viewsData = {
                    edit: true,
                    pageTile: " Edit Product"
                };
                // let catagories =categoryModel.find()
                res.render('admin/add-products', { categories, admin: true })

            })
        } catch (error) {
            console.log(error)
        }

    },

    postAddProducts: async (req, res) => {
        try {
            console.log(req.body, 'body')

            const files = req.files
            const images = files.map((file) => {
                return file.filename
            })

            let productData = req.body;
            productData.slug = slugify(productData.productName, { lower: true })

            productHelpers.addProduct(productData, images).then(() => {
                res.redirect('/admin/add-products')
            })

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
            const proSlug = req.params.slug
            const product = await productHelpers.findProduct(proSlug)
            const categories = await categoryModel.find()
            console.log(product);
            res.render('admin/edit-products', { admin: true, product, categories })
        } catch {
            res.redirect('/admin/products')
        }
    },

    postEditProducts: (req, res) => {
        try {
            console.log(req.body, 'postEditProducts sample');
            console.log(req.params.id);

            let files = req.files;
            const productId = req.params.id
            let images = []

            console.log(files, '💸 images 💸');

            if (files && files.length > 0) {
                images = files.map((file) => {
                    return file.filename;
                })

            }
            console.log('🌹🌹', req.body, '🌹🌹', productId, '🌹🌹', images, '🌹🌹');

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
            console.log(productId, 'kkkkkk');

            const product = await productModel.findById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            await productHelpers.deleteProductById(productId); // Update the function name to `deleteProductById`

            //   swal.fire({
            //     icon: 'success',
            //     title: 'Success',
            //     text: 'Product deleted successfully',
            //   });
            res.status(200).json({ success: true });

            // res.redirect('/admin/products-List');
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            res.status(500).json({ error: 'Failed to delete product' });
        }
    },

    getForm: (req, res) => {
        res.render('admin/add-form', { admin: true })
    },

    postForm: (req, res) => {
        console.log(req.body);
        console.log(req.file);
        return res.redirect('/add-form')
    }
}