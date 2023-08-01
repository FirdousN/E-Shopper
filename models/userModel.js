const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "can't be blank"]
    },
    mobile: {
        type: Number,
        required: [true, "can't be blank"]
    },
    email: {
        type: String,
        lowercase: true,
        unique: true, required: [true, "can't be blank"],
        index: true
    },
    password: {
        type: String,
        required: [true, "can't be blank"]
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    },
    image:{
        type:String,
        required:false
    },
    // slug:{
    //     type: String,
    //     unique: true
    // },
    addresses: [{
        addresses:{ type:String} ,
        pincode: { type: Number },
      state: { type: String },
      country: { type: String },
      city: { type: String },
      district:{type:String}
        }
    ],
    wallet: {
        type: Number,
        default: 0
    },
    // id_admin:{
    //     type:Number,
    //     required:true
    // },
    // id_varified:{
    //     type:Number,
    //     default:0
    // },
    
});

module.exports = mongoose.model('User', userSchema);

// module.exports =User;