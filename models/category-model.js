const mongoose = require('mongoose');
const Schema = mongoose.Schema;



let categorySchema= new Schema({

    category:{
        type:String,
        unique: true,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    },
    gender:{
        type:String,
    },
    subcategory:{
        type:String,
        required:true
    },
    // image:[]

})


module.exports = mongoose.model('categories', categorySchema);