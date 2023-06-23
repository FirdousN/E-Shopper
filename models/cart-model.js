const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const cartSchema = new Schema({
    userId: {
       type: Schema.Types.ObjectId,
       ref:'User'

    },
    products: [
        {
            image: [],
            price: Number,
            item: {
                type: mongoose.Types.ObjectId,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            slug: {
                type: String,
                unique: true
            },
            // size: {
            //     type: String,
            //     required: true
            // },

            // tax: {
            //     type: Number,
            //     required: true
            // },
            // orderStatus: {
            //     type: String,
            // }
            // ,
            // deliveryStatus: {
            //     type: String,
            // }
        }

    ]

})



module.exports = mongoose.model('cart', cartSchema)

