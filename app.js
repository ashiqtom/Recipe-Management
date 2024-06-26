const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('./util/database');
const User = require('./models/user');
const Recipe = require('./models/recipe');
const Comment = require('./models/comment');
const Like = require('./models/like');

// Express app setup
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Associations
User.hasMany(Recipe, {onDelete: 'CASCADE', foreignKey: 'userId' });
Recipe.belongsTo(User, {onDelete: 'CASCADE', foreignKey: 'userId' });

User.hasMany(Comment, {onDelete: 'CASCADE', foreignKey: 'userId' });
Comment.belongsTo(User, {onDelete: 'CASCADE', foreignKey: 'userId' });

Recipe.hasMany(Comment, {onDelete: 'CASCADE', foreignKey: 'recipeId' });
Comment.belongsTo(Recipe, {onDelete: 'CASCADE', foreignKey: 'recipeId' });

User.hasMany(Like, {onDelete: 'CASCADE', foreignKey: 'userId' });
Like.belongsTo(User, {onDelete: 'CASCADE', foreignKey: 'userId' });

Recipe.hasMany(Like, {onDelete: 'CASCADE', foreignKey: 'recipeId' });
Like.belongsTo(Recipe, {onDelete: 'CASCADE', foreignKey: 'recipeId' });

// Logging middleware
app.use((req, res, next) => {
  console.log(req.url);
  next();
});


const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const recipeRoutes = require('./routes/recipe');
const auth=require('./middleware/auth');

app.use('/user', userRoutes);
app.use('/recipes', recipeRoutes);
app.use('/adminPower', auth.adminAuth);
app.use('/adminPower', adminRoutes);

// Serve static files
app.use((req, res) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});

// Start the server
sequelize
  .sync()
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
