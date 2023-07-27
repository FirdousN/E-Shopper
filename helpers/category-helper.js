// const bcrypt = require('bcrypt');
const categoryModel = require('../models/category-model');
var multer = require('../config/multer');
const slugify = require('slugify');
const ordersModel = require('../models/order-model')

module.exports = {
    addCategory: async (categoryData, images) => {
        console.log('lkjlkjlkljkljkljljkljkljl');
        try {
            const lowerCaseCategory = categoryData.category.toLowerCase();
            const categoryExist = await categoryModel.findOne({ category: { $regex: new RegExp(`^${lowerCaseCategory}$`, 'i') } })

            console.log(categoryExist, '👁️‍🗨️👁️‍🗨️👁️‍🗨️');

            if (categoryExist) {
                console.log('0000000000000000');
                throw new Error('Category already exists')
            } else {
                console.log("else case");
                const newCategory = new categoryModel({
                    category: categoryData.category,
                    gender: categoryData.gender,
                    subcategory: categoryData.subcategory,
                    image: images,
                    slug: categoryData.slug,
                })

                await newCategory.save()
                // .catch(reject())

            }
        } catch (error) {
            throw error;
        }
    },

    editCategory: async (categoryId, data, images) => {
        try {
            if (!images || images.length === 0) {
                const category = await categoryModel.findOne({ _id: new Object(categoryId) });
                // Check if the category exists and has an image
                if (category && category.image) {
                    // Assign the existing image to the 'images' variable
                    images = category.image;
                } 
            }
            console.log(data,'🧛🏻');
            await categoryModel.updateOne({ _id: new Object(categoryId) }, {
                $set: {
                    category: data.category,
                    // status: data.status,
                    gender: data.gender,
                    subcategory_id: data.subcategory,
                    image: images,
                }
            }).catch((error) => {
                console.log(error.message);
            })
        } catch (error) {
            throw error;
        }
    },

    deliverCategory: async (req, res) => {
        try {
            console.log('000000000002');

            // Use the aggregation pipeline to calculate the required values directly from the database
            const orders = await ordersModel.aggregate([
                {
                    $match: {
                        'products.deliveryStatus': 'payed'
                    } // Add any filters if needed
                },
                {
                    $unwind: "$products"
                },
                {
                    $group: {
                        _id: "$products.category",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                      categoryName: "$_id",
                      count: 1,
                      _id: 0
                    }
                  }
              
            ]);

            console.log('👻', orders, '👻', '000000000002');
            return orders;
        } catch (error) {
            console.log(error.message);
        }
    }

}