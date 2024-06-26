const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Recipe = sequelize.define('Recipe', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ingredients: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  cookingTime: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  servings: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING // Store image URL or path
  }
});

module.exports = Recipe;
