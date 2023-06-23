const mongoose = require('mongoose');
const cartModel = require('../models/cart-model');
const productModel = require('../models/product-model');
const orderModel = require('../models/order-model');
const { ObjectId } = require('mongodb');
const slugify = require('slugify');
const userModel = require('../models/userModel');



module.exports = {
    addToCart: async (slug, userId) => {
        try {
            console.log(slug, 'slug in add to cart *******');

            const product = await productModel.findOne({ slug }); // Convert string to ObjectId
            console.log(product, '👌👌product');

            if (!product) {
                throw new Error('Product not found');
            }
            const proId = product._id; // Use the product's ObjectId
            console.log(proId, '😊😊😊😊');

            let proObj = {
                image: product.image,
                slug: slug,
                price: product.productPrice,
                item: proId,
                quantity: 1,

            }
            return new Promise(async (resolve, reject) => {
                let userCart = await cartModel.findOne({ userId });

                if (userCart) {

                    console.log(userCart, 'user cart testing in if-1 😂😂😂😂');
                    console.log(userCart.products, '😍😍😍');
                    // console.log(products.item);
                    let proExist = userCart.products.findIndex(products => products.item.toString() === proId.toString())

                    console.log(proExist, '🌹🌹🌹');
                    if (proExist !== -1) {
                        console.log('if-2 product existing');
                        const cart = await cartModel.findOne({ 'products.item': proId })
                        console.log(cart, '❤️CART❤️');

                        await cartModel.updateOne(
                            { _id: cart._id, 'products.item': proId },
                            { $inc: { 'products.$.quantity': 1 } }
                        );


                    } else {
                        await cartModel.updateOne({ userId },
                            {
                                $push: { products: [proObj] }
                            })
                    }

                } else {
                    let cartObj = {
                        userId: userId,
                        products: [proObj],
                    };

                    await cartModel.create(cartObj);
                }
                resolve();
            })

        } catch (error) {
            return Promise.reject(error);
        }
    },

    getCartProduct: (userId) => {

        console.log(userId);
        return new Promise(async (resolve, reject) => {
            console.log('get cart product')
            try {
                let products = await cartModel.aggregate([
                    {
                        '$match': {
                            'userId': new mongoose.Types.ObjectId(userId)
                        }
                    },
                    // {
                    //     $unwind:'$products'
                    // },
                    {
                        '$lookup': {
                            'from': 'products',
                            'localField': 'products.item',
                            'foreignField': '_id',
                            'as': 'cartProduct'
                        }
                    },
                    // {
                    //     $project:{
                    //         item:1,quantity:1,product:{$arrayElemAt:['$products' , 0]}
                    //     }
                    // }
                ]).exec();
                if (products.length > 0) {
                    console.log(products[0].products, '👌');
                    resolve(products[0].products)
                } else {
                    resolve([])
                }
            } catch (error) {
                console.log(error.message);
                reject(error);
            }
        })

    },

    getCartCount: (userId) => {
        try {
            return new Promise(async (resolve, reject) => {
                let count = 0;
                let cart = await cartModel.findOne({ userId })
                if (cart) {
                    count = cart.products.length
                }
                resolve(count)

            })
        } catch (error) {
            console.log(error.message);
        }
    },


    changeProductQuantity: async (proSlug, userId, count) => {
        try {

            console.log(userId, 'testing user id ❤️');
            console.log(proSlug, 'testing product id ❤️');

            const cart = await cartModel.findOne({ userId });

            if (!cart) {
                throw new Error('Cart not found');
            }
            const product = cart.products.find((item) => item.slug === proSlug);
            if (!product) {
                throw new Error('Product not found in cart');
            }
            console.log(product.quantity);
            
            const quantity = product.quantity;
            if (count == -1 && quantity == 1) {
                await cartModel.updateOne(
                    { _id: cart._id, 'products._id': product._id.toString() },
                    { $pull: { products: { _id: product._id } } }
                );
                return Promise.resolve({ removeProduct: true })

            } else {
                await cartModel.updateOne(
                    { _id: cart._id, 'products._id': product._id.toString() },
                    { $inc: { 'products.$.quantity': count } }
                );
            }

            return Promise.resolve();
        } catch (error) {
            console.log(error.message);
            return Promise.reject(error);
        }
    },
    removeProduct: async (proSlug, userId) => {

        const cart = await cartModel.findOne({ userId });

        if (!cart) {
            throw new Error('Cart not found');
        }

        const product = cart.products.find((item) => item.slug === proSlug);
        console.log(product, '////');
        if (!product) {
            throw new Error('Product not found in cart');
        }

        await cartModel.updateOne(
            { _id: cart._id, 'products._id': product._id.toString() },
            { $pull: { products: { _id: product._id } } }
        );
        return Promise.resolve({ removeProduct: true })

    },
    getTotalAmount: (product) => {
        return new Promise(async (resolve, reject) => {
            try {
                let total = 0;
                for (let i = 0; i < product.length; i++) {
                    total += product[i].price * product[i].quantity;

                }

                console.log("lllllllll");
                console.log(product);
                console.log(total);
                console.log("lllllllll");

                if (product.length > 0) {
                    //   console.log(cartProducts[0].products,'🌹product🌹');
                    //   console.log(cartProducts[0].total,'🌹 total🌹');
                    resolve(total);
                } else {
                    resolve(0);
                }
            } catch (error) {
                console.log(error.message);
                reject(error);
            }
        });
    },

    placeOrder: async (order, paymentMethod, userId, products, total) => {
        try {
            return new Promise(async (resolve, reject) => {
                
                console.log(order, '😶‍🌫️order');
                console.log(products, '😶‍🌫️ products');
                console.log(total, '😶‍🌫️ total');

                // let userId = order.userId;
                let status = paymentMethod === 'COD' ? 'placed' : 'pending'
                // console.log(order.paymentMethod);
                // if (order.paymentMethod === 'COD'){
                let orderObj = {
                    deliveryDetails: {
                        addresses: order.addresses,
                        country: order.country,
                        state: order.state,
                        pinCode: order.pincode,
                        // district:order.district
                    },
                    userId: userId,
                    paymentMethod: paymentMethod,
                    products: products,
                    status: status,
                    totalAmount: total,
                }

                await orderModel.create(orderObj).then(async (response) => {
                    await cartModel.deleteOne({ userId })
                    console.log('💸💸💸', response,'💸💸💸');
                    if (response) {
                        resolve(response._id);
                    } else {
                        reject(new Error('Failed to create order.'));
                    }
                })
                // }

                // const createdOrder = await orderModel.findOneAndUpdate({ userId },orderObj,
                //     { upsert: true, new: true }
                //   );

                //   if (createdOrder) {
                //     await cartModel.deleteOne({ userId });
                //     console.log(createdOrder,'🌹cart-helper.js => 🌹');
                //     resolve(createdOrder);
                //   } else {
                //     reject(new Error('Failed to create order.'));
                //   }

            })
        } catch (error) {

            console.log(error.message);
        }
    },

    getCartProductList: async (userId) => {
        try {
            console.log(userId, '😁 userId in getCartProducts');
            
            return new Promise(async (resolve, reject) => {
                let cart = await cartModel.findOne({ userId })
                if (!cart || !cart.products) {
                    resolve([]);
                } else {
                    resolve(cart.products)
                }

            });
        } catch (error) {
            console.log(error.message);
            throw error;
        }

    },
    getUserAddress: async (userData, userId) => {
        try {
            const user = await userModel.findOne({ _id: userId });
            let address = user.addresses;
            console.log('Address Exist:', user, '😷😷user:😷😷');
            console.log('Address Exist:', address, '😷😷Address Exist:😷😷');

            if(userData.addressRadio === 'newAddress'){
                const newAddress = {
                    addresses: userData.addresses,
                    pincode: userData.pinCode,
                    country: userData.country,
                    district: userData.district,
                    state: userData.state,
                    city: userData.city
                };

                await userModel.updateOne(
                    { _id: userData.userId },
                    { $push: { addresses: newAddress } }
                ).catch((error) => {
                    console.log(error.message);
                });

                address = [newAddress]; // Update the address variable
                return address;
            }else{
                let result
                address.forEach(addr => {
                    if(addr._id.equals(userData.addressRadio)){
                        result = addr
                    }
                })
                return result
            }

            if (!address || !address.length) {
                console.log('❤️ Address does not exist❤️');
                if (!userData.addresses.length || !userData.pinCode.length || !userData.country.length || !userData.state.length || !userData.city.length) {
                    console.log('😷😷 empty address field , fill address properly 😷😷😷');

                } else {
                    console.log('second else case no empty address field ❤️❤️❤️❤️❤️❤️');
                    const newAddress = {
                        addresses: userData.addresses,
                        pincode: userData.pinCode,
                        country: userData.country,
                        state: userData.state,
                        city: userData.city
                    };

                    await userModel.updateOne(
                        { _id: userData.userId },
                        { $push: { addresses: newAddress } }
                    ).catch((error) => {
                        console.log(error.message);
                    });

                    address = [newAddress]; // Update the address variable
                }

            }

            console.log('Updated Address:', address, '😊😊');

            return address;


        } catch (error) {
            console.log(error.message);
        }
    },



};
