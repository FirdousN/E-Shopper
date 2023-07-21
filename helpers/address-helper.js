const { ObjectId } = require('mongoose').Types;

const adminModel = require('../models/admin-model');
// const db = require('../config/connection')
// const userModel = require('../models/userModel')
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { default: mongoose } = require('mongoose');
const { userAddress } = require('./orders-helper');

module.exports = {
    findAddress: async (userId, addressId) => {
        try {
            console.log(userId, 'userId');
            console.log(addressId, 'addressId');
            const address = await userModel.findOne({ _id: userId })
            console.log("--------->", address, "address got!");

            const data = await userModel.aggregate([
                {
                    '$match': {
                        '_id': new mongoose.Types.ObjectId(userId)
                    }
                }, {
                    '$unwind': {
                        'path': '$addresses'
                    }
                }, {
                    '$project': {
                        '_id': 0,
                        'addresses': 1
                    }
                }, {
                    '$match': {
                        'addresses._id': new mongoose.Types.ObjectId(addressId)
                    }
                }
            ]);

            console.log(data, '👻👻');
            return data;
        } catch (err) {
            console.log(err);
        }
    },
    addAddress: async (address, userId) => {
        try {
            return new Promise(async (resolve, reject) => {
                let user = await userModel.findOne({ _id: userId })
                console.log(user, '🥶user🥶');
                user.addresses.push({
                    addresses: address.addresses,
                    pincode: address.pincode,
                    state: address.state,
                    country: address.country,
                    city: address.city,
                })
                await user.save().then(()=>{
                    resolve()
                })

                //resolve(user); // Resolve the promise with the updated user object
            })
        } catch (error) {
            console.log(error.message);
        }
    },
    editAddress: async (userId, addressId, updatedAddress) => {
        try {
            console.log(updatedAddress, '💸updatedAddress💸');

            await userModel.updateOne(
                { _id: userId, 'addresses._id': addressId }, // Find the document with the matching user ID and address ID
                {
                    $set: {
                        'addresses.$.street': updatedAddress.street,
                        'addresses.$.city': updatedAddress.city,
                        'addresses.$.state': updatedAddress.state,
                        'addresses.$.country': updatedAddress.country,
                        'addresses.$.pincode': updatedAddress.pincode
                    }
                } // Update the matched address with the updatedAddress object
            );

            console.log('Address updated successfully');
        } catch (error) {
            console.log(error.message);
        }
    }


}