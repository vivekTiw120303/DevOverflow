const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;

const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
require('dotenv').config();

const app = express();
const { createClient } = require('redis'); 

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Connect redis
const redisClient = createClient({
    socket: {
        host: 'redis',
        port: 6379
    }
});

redisClient.connect().catch(console.error);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    message: 'Too many requests, please try again later.',
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req,res) => {
    res.send('Welcome to the API!');
});

module.exports = app;