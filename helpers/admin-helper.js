const { resolveInclude } = require('ejs');
const adminModel = require('../models/admin-model');
// const db = require('../config/connection')
// const userModel = require('../models/userModel')
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

module.exports = {
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

    blockUser:async(id)=>{
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
