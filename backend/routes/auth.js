const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const {username,email,password} = req.body;
    try {
        // Check if user already exists
        const userExitsts = await User.findOne({email});
        if(userExitsts) return res.status(400).json({error: 'User already exists'});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({username,email,password: hashedPassword});

        const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {expiresIn: '30d'});
        res.status(201).json({token});
    } catch(err){
        res.status(500).json({error: 'Server error'});
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token });
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  });

  module.exports = router;