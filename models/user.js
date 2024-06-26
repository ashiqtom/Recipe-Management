const Sequelize=require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('User', {
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

module.exports = User;