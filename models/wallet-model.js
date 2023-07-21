const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    balance: {
        type: Number,
        default: 0
    },
    updateAt: {
        type: Date,
        // required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

})

module.exports = mongoose.model("Wallet", walletSchema);