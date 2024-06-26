const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.authenticate=async(req,res,next)=>{
    try{
        const token=req.header('authorization');
        const user=jwt.verify(token,process.env.jwtSecretkey);
        
        const userDetails=await User.findByPk(user.userId)
        req.user=userDetails;
        next();
    } catch(error){
        console.log(error); 
        return res.status(401).json({success:false});
    }
}


exports.adminAuth=async(req,res,next)=>{
    try{
        const token=req.header('authorization');
        console.log(token)
        const user=jwt.verify(token,process.env.jwtSecretkey);
        
        const userDetails=await User.findByPk(user.userId)
        if(!userDetails.isAdmin){
            return res.status(403).json({ message: 'Not authorized ' });
        }
        req.user=userDetails;
        next();
    } catch(error){
        console.log(error); 
        return res.status(401).json({success:false});
    }
}