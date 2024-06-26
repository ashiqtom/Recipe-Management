const User = require('../models/user');
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');
const Recipe = require('../models/recipe');


exports.getUserProfile = async (req, res) => {
  try {
    console.log(req.user.id)
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email'],
      include: [{ model: Recipe }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user, recipes: user.Recipes });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getFavorites = async (req, res) => {
  const { userId } = req;

  try {
    const user = await User.findByPk(userId, { include: Recipe });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favorites = user.Recipes;
    res.status(200).json(favorites);
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const stringValidate=(string)=>{
    if(string===undefined || string.length===0){
        return false;
    }else{
        return true;
    }
}

exports.signupUser=async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if(!stringValidate(username)|| !stringValidate(email)||!stringValidate(password)){
            return res.status(400).json({error:"bad request ,something is missing"});        
        }
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const saltrounds=Number(process.env.saltrounds);
        const hashedPassword = await bcrypt.hash(password,saltrounds); //blowfish 

        await User.create({ username, email, password:hashedPassword});
        res.status(201).json({message: 'Successfuly create new user'});
    } catch (error) {
        console.error('error signing up:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}



exports.loginUser = async (req, res) => {
    try {
        const { email, password} = req.params; 
        const existingUser = await User.findOne({ where: { email } });
        
        if (!existingUser) {
            return res.status(404).json({ error: 'Invalid email' });
        }
        const passwordCompared=await bcrypt.compare(password,existingUser.password);

        if(passwordCompared){
            return res.status(200).json({ success: true, message: "User logged in successfully",userName:existingUser.username,token: generateAccessToken(existingUser.id,existingUser.username)});
        }else{
            return res.status(400).json({success: false, error: 'Password is incorrect'});
        }

    } catch (error) {
        console.error('error login:', error);
        return res.status(500).json({error: 'Internal server error', success: false});
    }
};

const generateAccessToken=(id,name)=>{
    return jwt.sign({userId:id,name:name},process.env.jwtSecretkey)
};
