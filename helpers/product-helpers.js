const mongoose = require('mongoose');
const productModel = require('../models/product-model');
const categoryModel = require('../models/category-model');
var multer = require('../config/multer');
const { ObjectId } = require('mongodb');
const slugify = require('slugify');
const orderModel = require('../models/order-model');
const { returnOrder } = require('./orders-helper');


module.exports = {


    addProduct: (productData, category_id, images) => {
        try {
            console.log(productData, "add product ,helper");
    
            return new Promise(async (resolve, reject) => {
                const newProduct = new productModel({
                    productName: productData.productName,
                    productPrice: productData.productPrice,
                    description: productData.description,
                    category: productData.category,                    
                    category_id: new mongoose.Types.ObjectId(category_id), // Use the new keyword here
                    subcategory: productData.subcategory,
                    stockQuantity: productData.stockQuantity,
                    image: images,
                    slug: productData.slug,
                });
    
                await newProduct.save().then(() => {
                    resolve();
                });
    
            });
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
            if (!images || images.length === 0) {
                const product = await productModel.findOne({ _id: new ObjectId(productId) });
                // Check if the product exists and has an image
                if (product && product.image) {
                    // Assign the existing image to the 'images' variable
                    images = product.image;
                } 
            }
            await productModel.updateOne({ _id: new ObjectId(productId) }, {
                $set: {
                    productName: data.productName,
                    productPrice: data.productPrice,
                    description: data.description,
                    category: data.category,
                    subcategory: data.subcategory,
                    image: images,
                    offerPrice: data.offerPrice,
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

    categoryOfProduct: async (categoryName) => {
        try {
            console.log(categoryName, 'categoryOfProduct of category');
            const products = await productModel.aggregate([
                {
                    $match: {
                        category: categoryName
                    }
                }
            ]);
            console.log(products,'❤️❤️📜');

            return products
        } catch (error) {
            console.log(error.message);
        }
    },
    getPriceRanges: async (priceFilters) => {
        try {
            let minPrice = 0;
            let maxPrice = 0;
    
            if (priceFilters.includes('price-1')) {
                minPrice = 100;
                maxPrice = 500;
            } else if (priceFilters.includes('price-2')) {
                minPrice = 501;
                maxPrice = 1000;
            } else if (priceFilters.includes('price-3')) {
                minPrice = 1001;
                maxPrice = 2000;
            } else if (priceFilters.includes('price-4')) {
                minPrice = 2001;
                maxPrice = 5000;
            } else if (priceFilters.includes('price-5')) {
                minPrice = 5001;
                maxPrice = 10000;
            } else if (priceFilters.includes('price-6')) {
                minPrice = 10001;
                maxPrice = 20000;
            }
    
            return [minPrice, maxPrice];
        } catch (error) {
            console.log(error.message);
        }
    }
    
}