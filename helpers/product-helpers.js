const mongoose = require('mongoose');
const productModel = require('../models/product-model');
const categoryModel = require('../models/category-model');
var multer = require('../config/multer');
const { ObjectId } = require('mongodb');
const slugify = require('slugify');
const orderModel = require('../models/order-model');


module.exports = {
    

    addProduct: (productData, images) => {
        try {
            console.log(productData, "add product ,helper");

            return new Promise(async (resolve, reject) => {
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


                await newProduct.save().then(() => {
                    resolve()
                })

            })
        } catch (error) {
            console.log(error.message);
        }

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
    findProduct: async (proSlug) => {
        try {
            console.log(proSlug, '👻👻');
            const products = await productModel.findOne({ slug: proSlug })
            if (!products) {
                // productModel.deleteOne({_id:productId})
                return false; // or throw error if needed
            }

            return products

        } catch (error) {
            throw error;
        }

    },
    editProducts: async (productId, data, images) => {
        try {
            await productModel.updateOne({ _id: new ObjectId(productId) }, {
                $set: {
                    productName: data.productName,
                    productPrice: data.productPrice,
                    description: data.description,
                    category: data.category,
                    subcategory: data.subcategory,
                    image: images,
                    offerPrice:data.offerPrice,
                }
            }).catch((error) => {
                console.log(error.message);
            })

        } catch (error) {
            console.log(error.message);
            throw error;
        }
    },

    deleteProductById: async (productId) => {
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
            console.error(error); // Add this line to log the error
            console.log(error.message);
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

    categoryOfProduct:async(categoryName)=>{
        try {
            console.log(categoryName,'categoryOfProduct of category');
            const products = await productModel.aggregate([
                {
                  $match: {
                    category: categoryName
                  }
                }
              ]);

              return products
        } catch (error) {
            console.log(error.message);
        }
    }
}