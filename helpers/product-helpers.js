const mongoose = require('mongoose');
const productModel = require('../models/product-model');
const categoryModel = require('../models/category-model');
var multer = require('../config/multer');
const { ObjectId } = require('mongodb');
const slugify = require('slugify');


module.exports = {

    addProduct: (productData, images) => {
        console.log(productData, "add product ,helper");

        return new Promise((resolve, reject) => {
            // const slug = slugify(productData.productName, {lower: true})
            const newProduct = new productModel({
                productName: productData.productName,
                productPrice: productData.productPrice,
                description: productData.description,
                category: productData.category,
                subcategory: productData.subcategory,
                stockQuantity: productData.stockQuantity,
                image: images,
                slug: productData.slug,
            });


            newProduct.save().then(() => {
                resolve()
            })
                .catch(() => {
                    reject()
                })
        })

    },

    getAllProducts: () => {
        return new Promise((resolve, reject) => {
            productModel.aggregate([{
                $match: {
                    $or: [
                        { $and: [{ name: { $regex: new RegExp(key, 'i') } }, { isDeleted: false }] }, { category: { $regex: new RegExp(key, 'i') } }
                    ]
                }
            }]).then((products) => {
                console.log(products);
                resolve(products)
            }).catch((error) => {
                console.log(error);
                reject()
            })
        })
    },
    findProduct: async (productId) => {
        try {
            const products = await productModel.findById(productId)
            if (!products) {
                // productModel.deleteOne({_id:productId})
                return false; // or throw error if needed
            }

            return products

        } catch (error) {
            throw error;
        }

    },
    editProducts: async (productId, data) => {
        try {
            await productModel.updateOne({ _id: new ObjectId(productId) }, {
                $set: {
                    productName: data.productName,
                    productPrice: data.productPrice,
                    description: data.description,
                    category: data.category,
                    subcategory: data.subcategory,

                }
            }).catch((error) => {
                console.log(error.message);
            })

        } catch (error) {
            throw error;
        }
    },

    DeleteProductId: async (productId) => {
        try {
            const products = await productModel.findById(productId)
            if (!products) {
                // productModel.deleteOne({_id:productId})
                return false; // or throw error if needed
            }

            products.deleted = true;
            await products.save();

            return true
        } catch (error) {
            throw error;
        }

    },

    // searchProducts:(key)=>{
    //     return new Promise((resolve,reject)=>{
    //         productModel.aggregate([{
    //             $match:{
    //                 $or:[
    //                 {$and:[{name: { $regex: new RegExp(key, 'i') }},{isDeleted:false}]}, { category: { $regex: new RegExp(key, 'i') } }
    //                 ]
    //             }
    //         }]).then((products)=>{
    //             console.log(products);
    //            resolve(products)
    //         }).catch((error)=>{
    //             console.log(error)
    //             reject()
    //         })
    //     })
    // },

    viewProduct: (proId) => {
        return new Promise((resolve, reject) => {
            productModel.findOne({ _id: proId }).then((product) => {
                resolve(product)
            }).catch(() => {
                reject()
            })
        })
    },
}