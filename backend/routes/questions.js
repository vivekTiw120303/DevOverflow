// backend/routes/questions.js
const express = require('express');
const auth = require('../middlewares/auth');
const questionController = require('../controllers/questionController');
const cache = require('../middlewares/cache'); // Import Cache Middleware

const router = express.Router();

router.route('/')
    .post(auth, questionController.createQuestion)
    // Apply cache middleware: prefix 'questions', Time-To-Live 5 minutes (300s)
    .get(cache('questions', 300), questionController.getAllQuestions);

// Cache tag searches too!
router.get('/tag/:tag', cache('questions_tag', 300), questionController.getQuestionsByTag);
router.get('/search/:keyword', questionController.searchQuestions);

router.post('/:id/answer', auth, questionController.addAnswer);
router.post('/:id/upvote', auth, questionController.toggleUpvote);
router.get('/:id/flag', auth, questionController.flagQuestion);

module.exports = router;