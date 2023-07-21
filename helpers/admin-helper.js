const { resolveInclude } = require('ejs');
const adminModel = require('../models/admin-model');
// const db = require('../config/connection')
const ordersModel = require('../models/order-model')
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

module.exports = {
    categoryOrderData: async (orders, categories) => {
        try {
            console.log('categoryCount');

            // const categoryOrderDetails = {};

            const categoryOrderData = await ordersModel.aggregate([
                {
                    $match: {
                        _id: { $in: orders.map((order) => order._id) }
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "products.item",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                {
                    $unwind: "$productDetails"
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "productDetails.category",
                        foreignField: "_id",
                        as: "categoryDetails"
                    }
                },
                {
                    $unwind: "$categoryDetails"
                },
                {
                    $group: {
                        _id: "$categoryDetails.name",
                        count: { $sum: "$products.quantity" }
                    }
                }
            ]);

            const categoryOrderDataWithLabel = categoryOrderData.map((data) => ({
                label: data._id,
                count: data.count
            }));

            console.log(categoryOrderData, '👻categoryOrderCount👻');
            console.log(categoryOrderDataWithLabel, '👻categoryOrderDataWithLabel👻');

            return categoryOrderDataWithLabel;
        } catch (error) {
            console.log(error.message);
            return []; // Return an empty array in case of error
        }
    },
    calculateAnnualRevenue: async (orders) => {
        try {
            const startYear = 2022;
            const endYear = 2027;
            const annualRevenue = new Array(endYear - startYear + 1).fill(0);
        
            orders.forEach((order) => {
                order.products.forEach((product) => {
                  if (product.deliveryStatus === 'payed') {
                    const year = order.createdAt.getFullYear();
                    if (year >= startYear && year <= endYear) {
                      annualRevenue[year - startYear] += product.price * product.quantity;
                    }
                  }
                });
            });
        
          console.log(annualRevenue, 'Annual Revenue');
          return annualRevenue;
        } catch (error) {
          console.log(error.message);
        }
      },
  
    calculateMonthlyRevenue: async (orders) => {
        try {
            const monthlyRevenue = new Array(12).fill(0);
            orders.forEach((order) => {
                order.products.forEach((product) => {
                    const month = order.createdAt.getMonth();
                    let amount = 0
                    if (product.deliveryStatus === 'payed') {
                        amount = amount + product.price * product.quantity;
                        //  console.log(amount,'😁😁😁😁😁😁😁');
                    }

                    monthlyRevenue[month] += amount;
                });
            });
            console.log(monthlyRevenue, 'Monthly Revenue 2211552121211');

            return monthlyRevenue;

        } catch (error) {
            console.log(error.message);
        }
    },
    adminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let admin = await adminModel.findOne({ email: adminData.email })
            if (!adminData || !adminData.email) {
                reject('Invalid admin data');
                return;
            }
            try {
                admin = await adminModel.findOne({ email: adminData.email });
                if (admin) {
                    bcrypt.compare(adminData.password, admin.password)
                        .then((status) => {
                            console.log(status)
                            if (status) {
                                console.log('Admin Login Success');
                                const response = {
                                    admin: admin,
                                    status: true
                                };
                                resolve(response)
                            } else {
                                console.log('Admin login Failed');
                                reject({ status: false });
                            }
                        });
                } else {
                    console.log('Login Failed: User does not exist');
                    resolve({ status: false });
                }
            } catch (error) {
                console.log(error)
                reject(error);
            }
        });
    },

    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            userModel.find()
                .then(user => {
                    resolve(user);
                })
                .catch(error => {
                    reject(error);
                });
        });
    },

    blockUser: async (id) => {
        const userId = id
        try {
            const user = await userModel.findOne({ _id: userId })
            user.status = !user.status
            await user.save()
            return user.status
        } catch (error) {
            throw new Error(error)
        }
    },

    // unblockUser: async (userId) => {
    //     try {
    //       const user = await userModel.findOne({ _id: userId });
    //       user.isBlocked = false;
    //       await user.save();
    //       return user;
    //     } catch (error) {
    //       throw new Error(error);
    //     }
    //   },


    // signup method model

    // adminLogin:(adminData)=>{
    //     return new Promise(async (resolve, reject)=>{
    //         try{
    //             const emailExist = await adminModel.findOne({ email:userData.email})

    //             if(emailExist){
    //                 reject('Email is already exists ')
    //             }else{
    //                 userData.password = await bcrypt.hash(adminData.password, 10)
    //                 const newAdminDbDocument = new adminModel({
    //                     name: userData.name,
    //                     password: userData.password,
    //                     email: userData.email
    //                 })
    //                 newAdminDbDocument.save().then((newAdminDbDocument)=>{
    //                     const response={}
    //                     response.status = true
    //                     resolve(response)
    //                 }).catch((error)=>{
    //                     reject('Error save user document:' + error)
    //                 })
    //             }
    //         } catch(error){
    //             reject('Error checking existing email :' + error)
    //         }
    //     })
    // }

};
