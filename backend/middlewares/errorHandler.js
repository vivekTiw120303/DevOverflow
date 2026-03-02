// backend/middlewares/errorHandler.js
const AppError = require('../utils/AppError');
const logger = require('../utils/logger'); // IMPORT LOGGER

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log the error using Winston
    logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    if (err.statusCode === 500) {
        logger.error(err.stack); // Log the stack trace for major crashes
    }

    if (err.name === 'CastError') {
        err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
    }
    if (err.code === 11000) { 
        err = new AppError('Duplicate field value entered. Please use another value.', 400);
    }
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        err = new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
    }

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

module.exports = globalErrorHandler;