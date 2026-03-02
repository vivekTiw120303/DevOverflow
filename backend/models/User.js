const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    // ADDED: Reputation field to demonstrate multi-document transactions
    reputation: {
        type: Number,
        default: 0
    }
}, {timestamps: true} );

module.exports = mongoose.model('User', userSchema);