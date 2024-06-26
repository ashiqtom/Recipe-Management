const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Recipe = require('../models/recipe');

// Fetch all users (example)
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Delete user by ID (example)
router.delete('/users/:userId', async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.destroy();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Fetch all recipes (example)
router.get('/recipes', async (req, res, next) => {
  try {
    const recipes = await Recipe.findAll();
    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

// Delete recipe by ID (example)
router.delete('/recipes/:recipeId', async (req, res, next) => {
  const { recipeId } = req.params;
  try {
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    await recipe.destroy();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
