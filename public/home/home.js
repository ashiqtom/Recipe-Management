document.addEventListener('DOMContentLoaded', () => {
  const navRecipes = document.getElementById('navRecipes');
  const navCreateRecipe = document.getElementById('navCreateRecipe');
  const navProfile = document.getElementById('navProfile');
  const recipesSection = document.getElementById('recipesSection');
  const createRecipeSection = document.getElementById('createRecipeSection');
  const profileSection = document.getElementById('profileSection');
  const createRecipeForm = document.getElementById('createRecipeForm');
  const recipesDiv = document.getElementById('recipes');
  const userDetailsDiv = document.getElementById('userDetails');
  const userRecipesDiv = document.getElementById('userRecipes');

  const showPage = (page) => {
    recipesSection.style.display = 'none';
    createRecipeSection.style.display = 'none';
    profileSection.style.display = 'none';
    if (page === 'recipes') {
      recipesSection.style.display = 'block';
      getRecipes();
    } else if (page === 'createRecipe') {
      createRecipeSection.style.display = 'block';
    } else if (page === 'profile') {
      profileSection.style.display = 'block';
      getUserProfile();
    }
  };

  navRecipes.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('recipes');
  });

  navCreateRecipe.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('createRecipe');
  });

  navProfile.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('profile');
  });

  createRecipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('recipeTitle').value;
    const ingredients = document.getElementById('recipeIngredients').value;
    const instructions = document.getElementById('recipeInstructions').value;
    const cookingTime = document.getElementById('cookingTime').value;
    const servings = document.getElementById('servings').value;
    const image = document.getElementById('recipeImage').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('ingredients', ingredients);
    formData.append('instructions', instructions);
    formData.append('cookingTime', cookingTime);
    formData.append('servings', servings);
    if (image) {
      formData.append('image', image);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/recipes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token
        }
      });
      console.log(response);
      alert('Recipe created successfully');
      showPage('recipes');
    } catch (err) {
      console.error('Error creating recipe:', err.response ? err.response.data : err);
      alert('Error creating recipe');
    }
  });
  const getRecipes = async () => {
    try {
      const response = await axios.get('/recipes');
      const recipes = response.data;
      recipesDiv.innerHTML = '';
      recipes.forEach(recipe => {
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');
        recipeDiv.innerHTML = `
          <h3>${recipe.title}</h3>
          <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
          <p><strong>Instructions:</strong> ${recipe.instructions}</p>
          <p><strong>Cooking Time:</strong> ${recipe.cookingTime} minutes</p>
          <p><strong>Servings:</strong> ${recipe.servings}</p>
          ${recipe.imageUrl ? `<img src="/${recipe.imageUrl}" alt="${recipe.title}" width="100">` : ''}
        `;
        recipesDiv.appendChild(recipeDiv);
      });
    } catch (err) {
      console.error('Error getting recipes:', err.response.data);
    }
  };

const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/user/profile', {
      headers: {
        'Authorization': token
      }
    });
    const user = response.data.user;
    const userRecipes = response.data.recipes;

    userDetailsDiv.innerHTML = `
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
    `;

    userRecipesDiv.innerHTML = '';
    userRecipes.forEach(recipe => {
      const recipeDiv = document.createElement('div');
      recipeDiv.classList.add('recipe');
      recipeDiv.innerHTML = `
        <h3>${recipe.title}</h3>
        <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
        <p><strong>Instructions:</strong> ${recipe.instructions}</p>
        <p><strong>Cooking Time:</strong> ${recipe.cookingTime} minutes</p>
        <p><strong>Servings:</strong> ${recipe.servings}</p>
        ${recipe.imageUrl ? `<img src="/${recipe.imageUrl}" alt="${recipe.title}" width="100">` : ''}
        <button onclick="window.editRecipeInline(${recipe.id})">Edit</button>
        <button onclick="window.deleteRecipe(${recipe.id})">Delete</button>
      `;
      userRecipesDiv.appendChild(recipeDiv);
    });

  } catch (err) {
    console.error('Error getting profile:', err);
  }
};

window.editRecipeInline = async (recipeId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/recipes/${recipeId}`, {
      headers: {
        'Authorization': token
      }
    });
    console.log(response)
    const recipe = response.data;

    // Create an edit form in place of the recipe details
    let recipeDiv = document.getElementById(`recipe_${recipeId}`);
    if (!recipeDiv) {
      recipeDiv = document.createElement('div');
      recipeDiv.id = `recipe_${recipeId}`;
      recipeDiv.classList.add('recipe');
      userRecipesDiv.appendChild(recipeDiv);
    }
    recipeDiv.innerHTML = `
      <form id="editForm_${recipeId}" onsubmit="submitEdit(${recipeId}); return false;">
        <input type="text" id="editTitle_${recipeId}" value="${recipe.title}" required>
        <textarea id="editIngredients_${recipeId}" required>${recipe.ingredients}</textarea>
        <textarea id="editInstructions_${recipeId}" required>${recipe.instructions}</textarea>
        <input type="number" id="editCookingTime_${recipeId}" value="${recipe.cookingTime}" required>
        <input type="number" id="editServings_${recipeId}" value="${recipe.servings}" required>
        <button type="window.submit">Save</button>
      </form>
    `;
  } catch (err) {
    console.error(`Error fetching recipe ${recipeId} for editing:`, err);
    alert('Error fetching recipe for editing');
  }
};

window.submitEdit = async (recipeId) => {
  const editTitle = document.getElementById(`editTitle_${recipeId}`).value;
  const editIngredients = document.getElementById(`editIngredients_${recipeId}`).value;
  const editInstructions = document.getElementById(`editInstructions_${recipeId}`).value;
  const editCookingTime = document.getElementById(`editCookingTime_${recipeId}`).value;
  const editServings = document.getElementById(`editServings_${recipeId}`).value;

  const formData = new FormData();
  formData.append('title', editTitle);
  formData.append('ingredients', editIngredients);
  formData.append('instructions', editInstructions);
  formData.append('cookingTime', editCookingTime);
  formData.append('servings', editServings);

  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`/recipes/${recipeId}`, formData, {
      headers: {
        'Authorization': token,
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log(response);
    alert('Recipe updated successfully');
    getUserProfile(); // Refresh profile to reflect updated recipe
  } catch (err) {
    console.error('Error updating recipe:', err.response.data);
    alert('Error updating recipe');
  }
};

window.deleteRecipe = async (recipeId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`/recipes/${recipeId}`, {
      headers: {
        'Authorization': token
      }
    });
    console.log(response);
    alert('Recipe deleted successfully');
    getUserProfile(); // Refresh profile to reflect deleted recipe
  } catch (err) {
    console.error('Error deleting recipe:', err.response.data);
    alert('Error deleting recipe');
  }
};

});