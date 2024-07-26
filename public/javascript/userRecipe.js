// Yeo Jin Rong
document.addEventListener("DOMContentLoaded", function () {
  // Initialize variables and constants
  const accessToken = localStorage.getItem("AccessToken");
  const imageBase = "https://img.spoonacular.com/ingredients_500x500/";
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  let allRecipes = []; // To store all fetched recipes
  let currentRecipeId = null; // To store the currently viewed recipe ID
  let currentIngredients = []; // To store the currently viewed ingredients

  // Add event listeners for search functionality
  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      performSearch();
    }
  });

  // Function to perform search on recipes
  function performSearch() {
    const searchQuery = searchInput.value.toLowerCase().trim();
    const filteredRecipes = allRecipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(searchQuery)
    );
    displayRecipes(filteredRecipes);
  }

  // Function to fetch recipes of the user
  function fetchRecipes() {
    fetch("http://localhost:3500/recipes/fetchuserrecipes", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        allRecipes = data; // Store fetched recipes
        displayRecipes(data);

        if (data.length === 0) {
          alert("No recipes found.");
          return;
        }
      })
      .catch((error) => console.error("Error fetching recipes:", error));
  }

  // Function to display recipes on the page
  function displayRecipes(recipes) {
    const recipeGrid = document.getElementById("recipeGrid");
    recipeGrid.innerHTML = ""; // Clear the grid before adding new recipes

    if (recipes.length === 0) {
      recipeGrid.innerHTML = "<p>No recipes found.</p>";
      return;
    }

    recipes.forEach((recipe) => {
      recipeGrid.appendChild(createRecipeCard(recipe));
    });

    // Add event listeners for edit buttons
    document.querySelectorAll(".edit-recipe-button").forEach((button) => {
      button.addEventListener("click", function () {
        const recipe = JSON.parse(this.getAttribute("data-recipe"));
        populateEditForm(recipe);

        document.getElementById("editRecipeForm").onsubmit = function (event) {
          event.preventDefault();
          const updatedRecipe = getUpdatedRecipeData(recipe.image);
          const changes = getRecipeChanges(recipe, updatedRecipe);
          const numEditableFields = 4; // Number of editable fields

          if (Object.keys(changes).length === 0) {
            alert("No changes detected.");
            return;
          }

          // Check if only some fields are edited
          // If so, send a PATCH request
          // Else, send a PUT request
          if (Object.keys(changes).length < numEditableFields) {
            console.log("PATCH Request Data:", changes);
            patchRecipe(recipe.id, changes);
          } else {
            console.log("PUT Request Data:", updatedRecipe);
            updateRecipe(recipe.id, updatedRecipe);
          }
        };
      });
    });

    // Add event listeners for view ingredients buttons
    document
      .querySelectorAll(".view-recipe-ingred-button")
      .forEach((button) => {
        button.addEventListener("click", function () {
          const recipeId = this.getAttribute("data-recipe-id");
          currentRecipeId = recipeId; // Store the current recipe ID
          fetchIngredients(recipeId);
        });
      });

    // Add event listeners for delete buttons
    document.querySelectorAll(".delete-recipe-button").forEach((button) => {
      button.addEventListener("click", function () {
        const recipeId = this.getAttribute("data-recipe-id");
        showDeleteRecipeModal(recipeId);
      });
    });
  }

  // Function to fetch ingredients of a recipe
  function fetchIngredients(recipeId) {
    fetch(`http://localhost:3500/recipes/fetchingredients/${recipeId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        currentIngredients = data; // Store the currently viewed ingredients
        displayIngredients(data);
      })
      .catch((error) => console.error("Error fetching ingredients:", error));
  }

  // Function to display ingredients in a modal
  function displayIngredients(ingredients) {
    const ingredientsList = document.getElementById("ingredientsList");
    ingredientsList.innerHTML = ""; // Clear the list before adding new ingredients

    ingredients.forEach((ingredient) => {
      const ingredientItem = document.createElement("div");
      ingredientItem.className = "ingredient-item";

      ingredientItem.innerHTML = `
        <img src="${imageBase}${ingredient.ingredient_image}" alt="${ingredient.ingredient_name}" class="ingredient-image" />
        <div class="ingredient-details">
          <div class="ingredient-name">Ingredient Name: ${ingredient.ingredient_name}</div>
          <div class="ingredient-amount">Amount: ${ingredient.amount} ${ingredient.unit}</div>
        </div>
      `;

      ingredientsList.appendChild(ingredientItem);
    });

    // Add delete ingredient button
    const deleteIngredientButton = document.createElement("button");
    deleteIngredientButton.textContent = "Delete Ingredient";
    deleteIngredientButton.id = "deleteIngredientButton";
    deleteIngredientButton.className = "btn btn-danger";
    deleteIngredientButton.addEventListener("click", handleDeleteIngredient);
    ingredientsList.appendChild(deleteIngredientButton);

    // Show the modal
    const ingredientsModal = new bootstrap.Modal(
      document.getElementById("ingredientsModal")
    );
    ingredientsModal.show();
  }

  // Function to handle deletion of an ingredient
  function handleDeleteIngredient() {
    const ingredientName = prompt(
      "Enter the exact ingredient name to be deleted:"
    );

    if (!ingredientName) {
      alert("Ingredient name is required.");
      return;
    }

    const ingredient = currentIngredients.find(
      (ing) =>
        ing.ingredient_name.toLowerCase() === ingredientName.toLowerCase()
    );

    if (!ingredient) {
      alert("Ingredient not found.");
      return;
    }

    deleteIngredient(ingredient);
  }

  // Function to delete an ingredient
  function deleteIngredient(ingredient) {
    fetch(
      `http://localhost:3500/recipes/deleterecipeingredients/${currentRecipeId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ingredient_id: ingredient.ingredient_id,
          ingredient_name: ingredient.ingredient_name,
        }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete ingredient");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Ingredient deleted:", data);
        alert("Ingredient deleted successfully");
        fetchIngredients(currentRecipeId); // Refresh ingredients

        // Dismiss the modal
        const ingredientsModal = bootstrap.Modal.getInstance(
          document.getElementById("ingredientsModal")
        );
        ingredientsModal.hide();

        // Remove any overlays
        document.body.classList.remove("modal-open");
        document.querySelector(".modal-backdrop").remove();
      })
      .catch((error) => {
        console.error("Error deleting ingredient:", error);
        alert("An error occurred while deleting the ingredient");
      });
  }

  // Generate recipe cards for retrieved recipes
  function createRecipeCard(recipe) {
    const recipeCard = document.createElement("div");
    recipeCard.className = "recipe-card";

    recipeCard.innerHTML = `
      <i id="delete-recipe-btn" class='bx bxs-x-circle delete-recipe-button' data-recipe-id='${
        recipe.id
      }'></i>
      <div class="recipe-image">
        <img src="${recipe.image}" alt="${recipe.title}" />
      </div>
      <div id="recipe-holder">
        <div class="recipe-details">
          <div class="recipe-title">${recipe.title}</div>
          <div class="recipe-description">
            <div>Servings: ${recipe.servings}</div>
            <div>Ready in: ${recipe.readyInMinutes} minutes</div>
            <div>Price per serving: $${(recipe.pricePerServing / 100).toFixed(
              2
            )}</div>
          </div>
        </div>
        <div class="recipe-action">
          <button class="edit-recipe-button" data-bs-toggle="modal" data-bs-target="#editRecipeModal" data-recipe='${JSON.stringify(
            recipe
          )}'>Edit</button>
          <button class="view-recipe-ingred-button" data-recipe-id='${
            recipe.id
          }'>View Ingredients</button>
        </div>
      </div>
    `;

    return recipeCard;
  }

  // Populate the edit form with the recipe details when User clicks edit
  function populateEditForm(recipe) {
    document.getElementById("recipeTitle").value = recipe.title;
    document.getElementById("recipeServings").value = recipe.servings;
    document.getElementById("recipeReadyInMinutes").value =
      recipe.readyInMinutes;
    document.getElementById("recipePricePerServing").value = (
      recipe.pricePerServing / 100
    ).toFixed(2);
  }

  // Function to get updated recipe data from the form
  function getUpdatedRecipeData(image) {
    return {
      title: document.getElementById("recipeTitle").value,
      servings: parseInt(document.getElementById("recipeServings").value, 10),
      readyInMinutes: parseInt(
        document.getElementById("recipeReadyInMinutes").value,
        10
      ),
      pricePerServing:
        parseFloat(document.getElementById("recipePricePerServing").value) *
        100,
      image: image,
    };
  }

  // Function to get changes in recipe details 
  function getRecipeChanges(originalRecipe, updatedRecipe) {
    const changes = {};

    if (originalRecipe.title !== updatedRecipe.title) {
      changes.title = updatedRecipe.title;
    }
    if (originalRecipe.servings !== updatedRecipe.servings) {
      changes.servings = updatedRecipe.servings;
    }
    if (originalRecipe.readyInMinutes !== updatedRecipe.readyInMinutes) {
      changes.readyInMinutes = updatedRecipe.readyInMinutes;
    }
    if (originalRecipe.pricePerServing !== updatedRecipe.pricePerServing) {
      changes.pricePerServing = updatedRecipe.pricePerServing;
    }

    return changes;
  }

  // Function to update recipe details using PUT request
  function updateRecipe(recipeId, updatedRecipe) {
    const requestData = {
      title: updatedRecipe.title,
      image: updatedRecipe.image,
      servings: updatedRecipe.servings,
      readyInMinutes: updatedRecipe.readyInMinutes,
      pricePerServing: updatedRecipe.pricePerServing,
    };

    fetch(`http://localhost:3500/recipes/updaterecipedetails/${recipeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update recipe");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Recipe updated:", data);
        fetchRecipes(); // Refresh the recipes
        alert("Recipe updated successfully");
      })
      .catch((error) => {
        console.error("Error updating recipe:", error);
        alert("An error occurred while updating the recipe");
      });
  }

  // Function to update recipe details using PATCH request
  function patchRecipe(recipeId, changes) {
    fetch(`http://localhost:3500/recipes/editrecipedetails/${recipeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(changes),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update recipe");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Recipe updated:", data);
        fetchRecipes(); // Refresh the recipes
        alert("Recipe updated successfully");
      })
      .catch((error) => {
        console.error("Error updating recipe:", error);
        alert("An error occurred while updating the recipe");
      });
  }

  // Function to show delete recipe modal to confirm deletion
  function showDeleteRecipeModal(recipeId) {
    currentRecipeId = recipeId;
    const deleteRecipeModal = new bootstrap.Modal(
      document.getElementById("deleteRecipeModal")
    );
    deleteRecipeModal.show();
  }

  document
    .getElementById("confirmDeleteRecipeButton")
    .addEventListener("click", function () {
      deleteRecipe(currentRecipeId);
    });

  function deleteRecipe(recipeId) {
    fetch(`http://localhost:3500/recipes/deleterecipe/${recipeId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete recipe");
        }
        fetchRecipes(); // Refresh the recipes
        alert("Recipe deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting recipe:", error);
        alert("An error occurred while deleting the recipe");
      });
  }

  // Event listener for add ingredient button
  document
    .getElementById("addIngredientButton")
    .addEventListener("click", function () {
      const addIngredientModal = new bootstrap.Modal(
        document.getElementById("addIngredientModal")
      );
      addIngredientModal.show();
    });

  document.getElementById("addIngredientForm").onsubmit = function (event) {
    event.preventDefault();
    const ingredientName = document.getElementById("ingredientName").value;
    const ingredientAmount = parseFloat(
      document.getElementById("ingredientAmount").value
    );
    const ingredientUnit = document.getElementById("ingredientUnit").value;

    if (!ingredientName || !ingredientAmount || !ingredientUnit) {
      alert("All fields are required.");
      return;
    }

    // Get the new ingredient data
    const newIngredient = {
      name: ingredientName,
      amount: ingredientAmount,
      unit: ingredientUnit,
    };

    addIngredient(newIngredient);
  };

  // Function to add an ingredient to a recipe
  function addIngredient(ingredient) {
    fetch(
      `http://localhost:3500/recipes/insertrecipeingredients/${currentRecipeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify([ingredient]),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add ingredient");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Ingredient added:", data);
        alert("Ingredient added successfully");
        fetchIngredients(currentRecipeId); // Refresh ingredients

        // Dismiss the modal
        const addIngredientModal = bootstrap.Modal.getInstance(
          document.getElementById("addIngredientModal")
        );
        addIngredientModal.hide();

        // Remove any overlays
        document.body.classList.remove("modal-open");
        document.querySelector(".modal-backdrop").remove();
      })
      .catch((error) => {
        console.error("Error adding ingredient:", error);
        alert("An error occurred while adding the ingredient");
      });
  }

  fetchRecipes(); // Initial fetch of recipes
});
