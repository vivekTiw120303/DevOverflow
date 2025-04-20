const express = require('express');
const auth = require('../middlewares/auth');
const Question = require('../models/Question');
const User = require('../models/User');
const router = express.Router();

router.get('/me', async (req,res) => {
    try{
        const user = User.findById(req.user).select('-password');
        if(!user) return res.status(404).json({msg: 'User not found'});

        const question = await Question.find({user: req.user}).sort({createdAt:-1});
        if(!question) return res.status(404).json({msg: 'No questions found'});

        return res.status(200).json({user, question});
    }catch(err){
        return res.status(500).json({msg:"Server error"});
    }
});

module.exports = router;