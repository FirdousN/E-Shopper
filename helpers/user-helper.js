const db = require('../config/connection')
// const collection = require('../config/multer')
const bcrypt = require('bcrypt');
const twilioFunctions = require("../config/twilio");
const userModel = require('../models/userModel');
const { generateOTP } = require("../config/twilio");

// const { ObjectId } = require('mongodb');


module.exports = {


  userSignup: async (userData) => { 
    try {
      console.log('///////////////////////////////');
      // Check if phone number has a minimum and maximum length of 10 digits
      if (userData.mobile.length !== 10) {
        throw new Error('Phone number must be 10 digits long');
      }
  
      const emailExist = await userModel.findOne({ email: userData.email });
      const numberExist = await userModel.findOne({ mobile: userData.mobile });
      
      if (emailExist || numberExist) {
        throw new Error('Email or mobile number already exists');
      }
  
      // Define password strength requirements
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
  
      // Check password against the defined criteria
      if (!passwordRegex.test(userData.password)) {
        throw new Error('Password must contain at least 8 characters, including uppercase and lowercase letters, numbers, and special characters');
      }
  
      // Hash the password using the correct field (userData.password)
      userData.password = await bcrypt.hash(userData.password, 10);
  
      const newUserDbDocument = new userModel({
        name: userData.name,
        mobile: userData.mobile,
        password: userData.password,
        email: userData.email
      });
  
      const newUser = await newUserDbDocument.save();
  
      const response = {
        user: newUser,
        status: true
      };
      console.log('signup success');
      return response;
    } catch (error) {
      console.log('Error:', error);
      throw error;
    }
  },
  
  userLogin: (userData) => {
    console.log('11111111110');
    return new Promise(async (resolve, reject) => {
      let user = await userModel.findOne({ email: userData.email });
      if (!userData || !userData.email) {
        reject('Invalid user data');
        return;
      }

      try {
        user = await userModel.findOne({ email: userData.email });
        console.log(user,'user');
        if (user ) {
          bcrypt.compare(userData.password, user.password).then((status) => {
            if (status) {
              console.log('Login Success');
              const response = {
                user: user,
                status: true
              }
              resolve(response);
            } else {
              console.log('Login Failed');
              resolve({ status: false });
            }
          });
        } else if (user.status == false) {

          resolve({ status: false, message: 'You are blocked ,You cant login' })
        }
        else {
          console.log('Login Failed: User does not exist');
          resolve({ status: false, message: 'User does not exist' });
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },


  // otp
  generateOtp: (body) => {
    console.log("Mobile No.//////////inController", body);
    return new Promise(async (resolve, reject) => {
      try {
        let customer = await userModel.findOne({ mobile: body });
        console.log("customer:inController", customer);
        if (customer) {
          await twilioFunctions.generateOTP(body);
          // const msg1 = "OTP SENT!!";
          resolve({ status: true, body: body });
        } else {
          console.log("No User Found!");
         
          resolve({ status: false  });
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },
  
  getAllCostumers:async() => {
    try {
        return new Promise(async(resolve, reject) => {
            await userModel.find()
                .then(user => {
                    resolve(user);
                })
                .catch(error => {
                    reject(error);
                });
        });
    } catch (error) {
        console.log(error.message);
    }
    
},

}