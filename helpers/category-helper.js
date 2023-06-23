// const bcrypt = require('bcrypt');
const categoryModel = require('../models/category-model');

module.exports = {
    addCategory: async (categoryData) => {
        try {
            //    const categoryExist = await categoryModel.find({ category:categoryData.category })
               const categoryExist = await categoryModel.findOne({ category: categoryData.category.toLowerCase() })

            console.log(categoryExist.category, '👁️‍🗨️👁️‍🗨️👁️‍🗨️');

            if (categoryExist.length) {
                throw new Error('Category already exists')
            } else {
                console.log("else case");
                const categories = new categoryModel({
                    category: categoryData.category,
                    gender: categoryData.gender,
                    subcategory: categoryData.subcategory
                })
                await categories.save()
                // .then(resolve())
                // .catch(reject())

            }
        } catch (error) {
            throw error;
        }
    },

    editCategory: async (categoryId, data) => {
        try {
            await categoryModel.updateOne({ _id: new Object(categoryId) }, {
                $set: {
                    category: data.category,
                    // status: data.status,
                    gender: data.gender,
                    subcategory: data.subcategory,

                }
            }).catch((error) => {
                console.log(error.message);
            })
        } catch (error) {
            throw error;
        }
    }

}