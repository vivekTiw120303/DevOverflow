// backend/controllers/questionController.js
const questionService = require('../services/questionService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const clearCache = require('../utils/clearCache');
const notificationQueue = require('../queues/notificationQueue');

exports.createQuestion = catchAsync(async (req, res, next) => {
    const { title, description, tags } = req.body;
    
    const savedQuestion = await questionService.createQuestion({
        title,
        description,
        tags,
        user: req.user
    });

    // INVALIDATE CACHE: A new question exists, so clear all cached question pages
    await clearCache('questions:*');

    res.status(201).json({
        status: 'success',
        data: savedQuestion
    });
});

exports.getAllQuestions = catchAsync(async (req, res, next) => {
    // We integrate pagination directly into the main GET route (Best Practice)
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10;

    const result = await questionService.getAllQuestions(page, limit);

    res.status(200).json({
        status: 'success',
        data: result
    });
});

exports.getQuestionsByTag = catchAsync(async (req, res, next) => {
    const questions = await questionService.findQuestionsByTag(req.params.tag);
    
    if (questions.length === 0) {
        return next(new AppError('No questions found with that tag', 404));
    }

    res.status(200).json({
        status: 'success',
        results: questions.length,
        data: questions
    });
});

exports.addAnswer = catchAsync(async (req, res, next) => {
    const { content } = req.body;
    
    // 1. Core Database Operation (Fast)
    const updatedQuestion = await questionService.addAnswer(
        req.params.id, 
        req.user, 
        content
    );

    // 2. Real-time Socket Emission (Fast)
    const io = req.app.get('io');
    io.emit('notifyNewAnswer', updatedQuestion._id);

    // 3. EVENT-DRIVEN QUEUE: Offload the heavy email/notification logic (Asynchronous)
    await notificationQueue.add('sendNewAnswerNotification', {
        questionId: updatedQuestion._id,
        answerContent: content,
        userId: req.user
    });

    // 4. Invalidate Cache since the question now has a new answer
    await clearCache('questions:*');

    // 5. Respond to the user immediately! They don't wait for Step 3.
    res.status(200).json({
        status: 'success',
        message: 'Answer added successfully',
        data: updatedQuestion
    });
});

exports.toggleUpvote = catchAsync(async (req, res, next) => {
    const upvoteCount = await questionService.toggleUpvote(req.params.id, req.user);

    res.status(200).json({
        status: 'success',
        upvotes: upvoteCount
    });
});

exports.searchQuestions = catchAsync(async (req, res, next) => {
    const questions = await questionService.searchQuestions(req.params.keyword);

    res.status(200).json({
        status: 'success',
        results: questions.length,
        data: questions
    });
});

exports.flagQuestion = catchAsync(async (req, res, next) => {
    await questionService.flagQuestion(req.params.id, req.user);

    res.status(200).json({
        status: 'success',
        message: 'Question flagged successfully'
    });
});