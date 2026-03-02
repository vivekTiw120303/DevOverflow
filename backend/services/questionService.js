// backend/services/questionService.js
const Question = require('../models/Question');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const User = require('../models/User');

exports.createQuestion = async (questionData) => {
    const question = new Question(questionData);
    return await question.save();
};

exports.getAllQuestions = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    
    const questions = await Question.find()
        .skip(skip)
        .limit(limit)
        .populate('user', 'username')
        .sort({ createdAt: -1 });
        
    const total = await Question.countDocuments();
    
    return {
        questions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalQuestions: total
    };
};

exports.getQuestionById = async (id) => {
    return await Question.findById(id);
};

exports.findQuestionsByTag = async (tag) => {
    return await Question.find({ tags: tag.toLowerCase() })
        .populate('user', 'username')
        .sort({ createdAt: -1 });
};

exports.addAnswer = async (questionId, userId, content) => {
    const question = await Question.findById(questionId);
    if (!question) throw new AppError('Question not found', 404);

    question.answers.push({ user: userId, content });
    return await question.save();
};

// 🔥 THE SENIOR FLEX: MongoDB ACID Transaction
exports.toggleUpvote = async (questionId, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // 1. Fetch Question (locked to this session)
        const question = await Question.findById(questionId).session(session);
        if (!question) throw new AppError('Question Not Found', 404);

        const hasUpvoted = question.upvotes.includes(userId);
        
        // 2. Fetch the Author of the question to update their reputation
        const author = await User.findById(question.user).session(session);

        if (!hasUpvoted) {
            question.upvotes.push(userId);
            if (author) { 
                author.reputation += 10; 
                await author.save({ session }); 
            }
        } else {
            question.upvotes.pull(userId); // Mongoose helper to remove from array
            if (author) { 
                author.reputation -= 10; 
                await author.save({ session }); 
            }
        }

        // 3. Save the question and COMMIT the transaction
        await question.save({ session });
        await session.commitTransaction();
        
        return question.upvotes.length;
    } catch (error) {
        // If anything fails above, ROLLBACK everything automatically
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

exports.searchQuestions = async (keyword) => {
    return await Question.find(
        { $text: { $search: keyword } },
        { score: { $meta: "textScore" } } 
    )
    .populate('user', 'username')
    .sort({ score: { $meta: "textScore" } }); // Sort by relevance!
};

exports.flagQuestion = async (questionId, userId) => {
    const question = await Question.findById(questionId);
    if (!question) throw new AppError('Question not found', 404);

    if (question.flags.includes(userId)) {
        throw new AppError('Already flagged', 400);
    }

    question.flags.push(userId);
    await question.save();
    return true;
};