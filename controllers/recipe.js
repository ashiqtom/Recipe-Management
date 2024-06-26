const Recipe = require('../models/recipe');
const Comment = require('../models/comment');
const Like = require('../models/like');
const User = require('../models/user');
const { Op } = require('sequelize');

exports.searchRecipes = async (req, res, next) => {
  const searchTerm = req.query.term;
  try {
    const results = await Recipe.findAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${searchTerm}%`
            }
          },
          {
            ingredients: {
              [Op.like]: `%${searchTerm}%`
            }
          },
          {
            instructions: {
              [Op.like]: `%${searchTerm}%`
            }
          }
        ]
      }
    });
    res.json(results);
  } catch (err) {
    console.error('Error searching recipes:', err);
    res.status(500).json({ error: 'Error searching recipes' });
  }
};


exports.getComments = async (req, res, next) => {
  const recipeId = req.params.id;
  try {
    const comments = await Comment.findAll({
      where: { recipeId },
      include: [{ model: User, attributes: ['username'] }] // Include user details
    });
    res.status(200).json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

exports.likeRecipe = async (req, res, next) => {
  const recipeId = req.params.id;
  const userId = req.user.id;
  console.log(recipeId,userId,'``````````')
  try {
    const existingLike = await Like.findOne({ where: { recipeId, userId } });
    if (existingLike) {
      return res.status(400).json({ message: 'Recipe already liked' });
    }
    const like = await Like.create({ recipeId, userId });
    res.status(201).json({ message: 'Recipe liked!', like });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
exports.getLikedRecipes = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const likes = await Like.findAll({ where: { userId }, include: [Recipe] });
    const likedRecipes = likes.map(like => like.Recipe);
    res.status(200).json(likedRecipes);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};


exports.addComment = async (req, res, next) => {
  const recipeId = req.params.id;
  const userId = req.user.id;
  const { text } = req.body;
  try {
    const comment = await Comment.create({ text, recipeId, userId });
    res.status(201).json({ message: 'Comment added!', comment });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const uploadToS3=async(data,filename)=>{
  try {
      const BUCKET_NAME=process.env.s3bucketName;
      const IAM_USER_KEY= process.env.s3Accesskey;
      const IAM_USER_SECRET= process.env.s3Secretaccesskey;

      const s3bucket=new AWS.S3({
          accessKeyId:IAM_USER_KEY,
          secretAccessKey:IAM_USER_SECRET
      })
      const params={
          Bucket:BUCKET_NAME,
          Key:filename,
          Body:data,
          ACL:'public-read'
      }
      const response = await s3bucket.upload(params).promise();
      return response; 
  } catch (error) {
      console.log('Upload error', error);
      throw error;
  }
}

exports.createRecipe = async (req, res) => {
  const { title, ingredients, instructions, cookingTime, servings } = req.body;
  const file = req.file ? req.file.path : null; // Assuming using multer for file uploads
  const uploadedFile = await uploadToS3(file.buffer, file.originalname);
  const imageUrl=uploadedFile.Location;
  
  try {
    const newRecipe = await Recipe.create({
      title,
      ingredients,
      instructions,
      cookingTime,
      servings,
      imageUrl,
      userId:req.user.id
    });

    res.status(201).json({ message: 'Recipe created successfully' });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error getting recipes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEditRecipe = async (req, res) => {
  const { recipeId } = req.params;
  try {
    const recipe = await Recipe.findByPk(recipeId);

    res.status(200).json(recipe);
  } catch (error) {
    console.error('Error editing recipe:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.editRecipe = async (req, res) => {
  const { recipeId } = req.params;
  const { title, ingredients, instructions, cookingTime, servings } = req.body;
  const imageUrl = req.file ? req.file.path : null; // Assuming using multer for file uploads

  try {
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user is authorized to edit this recipe (assuming userId is available in req)
    if (recipe.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this recipe' });
    }

    // Update recipe details
    recipe.title = title;
    recipe.ingredients = ingredients;
    recipe.instructions = instructions;
    recipe.cookingTime = cookingTime;
    recipe.servings = servings;
    if (imageUrl) {
      recipe.imageUrl = imageUrl;
    }

    await recipe.save();

    res.status(200).json({ message: 'Recipe updated successfully' });
  } catch (error) {
    console.error('Error editing recipe:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteRecipe = async (req, res) => {
  const { recipeId } = req.params;

  try {
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user is authorized to delete this recipe (assuming userId is available in req)
    if (recipe.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    await recipe.destroy();

    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};