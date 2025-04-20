const express = require('express');
const Question = require('../models/Question');
const auth = require('../middlewares/auth');
const router = express.Router();

// Create a new question
router.post('/', auth, async (req,res) => {
    const {title, description, tags} = req.body;
    
    try{
        const question = new Question({
            title,
            description,
            tags,
            user: req.user
        });  

        const savedQuestion = await question.save();
        return res.status(201).json(savedQuestion);
    }catch(err){
        console.error(err.message);
        return res.status(500).json({msg: 'Server error'});
    }
});


// Get all questions
router.get('/', async (req,res) =>{
    try{
        const qustions = await Question.find().populate('user','username').sort({createdAt:-1});
        return res.status(200).json(qustions);
    }catch(err){
        return res.status(500).json({msg: 'Server error'});
    }
});

// Add answer to a question
router.post('/:id/answer', auth, async (req,res) => {
    const {content} = req.body;

    try{
        const question = await Question.findById(req.params.id);
        if(!question) return res.status(404).json({msg: 'Question not found'});

        question.answers.push({ user: req.user, content});
        await question.save();
        const io = req.app.get('io');
        io.emit('notifyNewAnswer', question._id); // Emit event to notify new answer
        return res.status(200).json(question);
    }catch(err){
        return res.status(500).json({msg: 'Server error'});
    }
});

// Toggle upvote
router.post('/:id/upvote', auth, async (req,res) => {
    try{
        const question = await Question.findById(req.params.id);
        if(!question) return res.status(404).json({msg: 'Question Not Found'});

        const index = question.upvotes.indexOf(req.user);

        if(index == -1){
            question.upvotes.push(req.user);
            // return res.status(200).json({msg: 'Upvoted'});
        }
        else{
            question.upvotes.splice(index, 1);
            // return res.status(200).json({msg: 'Unvoted'});    
        }

        await question.save();
        res.json({upvotes: question.upvotes.length});
        
    }catch(err){
        console.log(err.message);
        return res.status(500).json({msg: 'Server error'});
    }
});

// Filter questions by tag
router.get('/tag/:tag', async (req, res) => {
    try{
        const tag = req.params.tag.toLowerCase();
        const questions = await Questions.find({tags: tag}).populate('user', 'username').sort({createdAt:-1});
        if(questions.length === 0) return res.status(404).json({msg: 'No questions found'});
        else return res.status(200).json(questions);

    }catch(err){
        console.log(err.message);
        return res.status(500).json({msg: 'Server error'});
    }
});

// Search by question id
router.get('/search/:keyword', async (req,res) =>{
    try{
        const keyword = req.params.keyword;
        const questions = await Question.find({
            $or: [
                {title: {$regex: keyword, options: 'i'}},
                {descriptions: {$regex: keyword, options: 'i'}}
            ]
        }).populate('user', 'username').sort({createdAt: -1});

        res.json(questions);

    }catch(err){
        console.log(err.message);
        return res.status(500).json({msg: 'Server error'});
    }
});

// Pagination
router.get('/page/:page', async (req,res) => {
    const page = parseInt(req.params.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    try{
        const quesitons = await Question.find()
            .skip(skip)
            .limit(limit)
            .populate('user', 'username')
            .sort({createdAt: -1});

        const total = await Questions.countDocuments();

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            questions
        });

    }catch(err){
        console.log(err.message);
        return res.status(500).json({msg: 'Server error'});
    }
});

// Flag a question
router.get('/:id/flag', auth, async (req,res) => {
    try{
        const question = await Question.findById(req.params.id);
        if(!question) return res.status(404).json({msg: 'Question not found'});

        if(question.flags.includes(req.user)){
            return res.status(400).json({msg: 'Already flagged'});
        }

        question.flags.push(req.user);
        await question.save();
        return res.status(200).json({msg: 'Question flagged successfully'});

    }catch(err){
        console.log(err.message);
        return res.status(500).json({msg: 'Server error'});
    }
});

module.exports = router;