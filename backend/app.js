const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');

// Import Error Handlers
const globalErrorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// Security and Utility Middlewares
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow your Next.js frontend
    credentials: true // Allow cookies/authorization headers if needed
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);

// Root Route
app.get('/', (req,res) => {
    res.send('Welcome to the DevOverflow API V2!');
});

// CATCH UNHANDLED ROUTES (404)
// If a request bypasses all the routes above, it hits this.
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLER
// This must be the absolute last middleware registered
app.use(globalErrorHandler);

module.exports = app;