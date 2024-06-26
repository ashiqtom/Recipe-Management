const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
});

module.exports = Comment;
