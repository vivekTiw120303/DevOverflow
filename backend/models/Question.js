const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    content: {type: String, required: true},
    createdAt: {type: Date,default: Date.now}
});

const questionSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String},
    tags: [{type: String}],
    user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    answers: [answerSchema],
    upvotes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    flags: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
}, {timestamps: true});

module.exports = mongoose.model('Question', questionSchema);