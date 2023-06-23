const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema(
{
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
      }
});


module.exports = mongoose.model("Admin", adminSchema);