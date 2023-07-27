const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema(
{
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
    email: {
        type: String,
        required: true,
        unique: true,
        default: 'admin@gmail.com'
    },
    password: {
        type: String,
        required: true,
        default: 'admin123'
    },
    canEditUsers: {
        type: Boolean,
        default: false
      },
      status: {
        type: Boolean,
        required: true,
        default: true
    },

    teamName:{
        type:String,
    }  

});


module.exports = mongoose.model("Admin", adminSchema);