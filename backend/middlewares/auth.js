const jwt = require('jsonwebtoken');

const auth = (req,res,next) => {
    const token = req.header('Authorization')?.split(" ")[1];
    if(!token) return res.status(401).json({msg: 'No token provided'});

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    }catch(err){
        return res.status(401).json({msg: 'Invalid token'});
    }
};

module.exports = auth;