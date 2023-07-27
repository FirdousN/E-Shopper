const userModel = require('../models/userModel')
const db = require('../config/connection')
// const collection = require('../config/multer')
const bcrypt = require('bcrypt');
const twilioFunctions = require("../config/twilio");
const { generateOTP } = require("../config/twilio");
/* const { getLogout } = require('../controllers/userController'); */
const { ObjectId } = require('mongodb');


module.exports = {


  doSignup: async (userData) => {
    
    try {
      console.log(userData.password, 'password checking');

      // Check if phone number has a minimum and maximum length of 10 digits
      if (userData.mobile.length !== 10) {
        console.log(userData.mobile);
        throw new Error('Phone number must be 10 digits long');
      }

      console.log(userData);
      const emailExist = await userModel.findOne({ email: userData.email });
      const numberExist = await userModel.findOne({ mobile: userData.mobile });
      const addressExist = await userModel.findOne({ addresses: userData.addresses });

      console.log('Address Exist:', emailExist);

      console.log('Email Exist:', emailExist);
      console.log('Number Exist:', numberExist);
      // Define password strength requirements
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

      // Check password against the defined criteria
      if (!passwordRegex.test(userData.password)) {
        throw new Error('Password must contain at least 8 characters, including uppercase and lowercase letters, numbers, and special characters');
      }
      if (emailExist || numberExist) {
        throw new Error('Email and mobile number already exist');

      } else if (emailExist) {
        throw new Error('Email already exists');

      } else if (numberExist) {
        throw new Error('Mobile number already exists');

      }
      console.log(Error, 'Error');//

      // Hash the password
      userData.password = await bcrypt.hash(userData.password2, 10);
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
        if (user && user.status) {
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