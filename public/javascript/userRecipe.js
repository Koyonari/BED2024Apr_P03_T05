document.addEventListener("DOMContentLoaded", function () {
  const accessToken = localStorage.getItem("AccessToken");

  let allRecipes = []; // To store all fetched recipes

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

  function displayRecipes(recipes) {
    const recipeGrid = document.getElementById("recipeGrid");
    recipeGrid.innerHTML = ""; // Clear the grid before adding new recipes

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
          const updatedRecipe = getUpdatedRecipeData(recipe.imageurl);
          const changes = getRecipeChanges(recipe, updatedRecipe);
          const numEditableFields = 4; // Number of editable fields

          if (Object.keys(changes).length === 0) {
            alert("No changes detected.");
            return;
          }

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

    // Add event listeners for delete buttons
    document.querySelectorAll(".delete-recipe-button").forEach((button) => {
      button.addEventListener("click", function () {
        const recipeId = this.getAttribute("data-recipe-id");
        deleteRecipe(recipeId);
      });
    });
  }

  function createRecipeCard(recipe) {
    const recipeCard = document.createElement("div");
    recipeCard.className = "recipe-card";

    recipeCard.innerHTML = `
      <i id="delete-recipe-btn" class='bx bxs-x-circle delete-recipe-button' data-recipe-id='${
        recipe.id
      }'></i>
      <div class="recipe-image">
        <img src="${recipe.imageurl}" alt="${recipe.title}" />
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
      </div>
      </div>
    `;

    return recipeCard;
  }

  function populateEditForm(recipe) {
    document.getElementById("recipeTitle").value = recipe.title;
    document.getElementById("recipeServings").value = recipe.servings;
    document.getElementById("recipeReadyInMinutes").value =
      recipe.readyInMinutes;
    document.getElementById("recipePricePerServing").value = (
      recipe.pricePerServing / 100
    ).toFixed(2);
  }

  function getUpdatedRecipeData(imageurl) {
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
      imageurl: imageurl,
    };
  }

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

  function updateRecipe(recipeId, updatedRecipe) {
    // Create an object with only the necessary fields
    const requestData = {
      title: updatedRecipe.title,
      imageurl: updatedRecipe.imageurl,
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

  document
    .getElementById("searchButton")
    .addEventListener("click", function () {
      const searchQuery = document
        .getElementById("searchInput")
        .value.toLowerCase();
      const filteredRecipes = allRecipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchQuery)
      );
      displayRecipes(filteredRecipes);
    });

  // Initial fetch of recipes
  fetchRecipes();
});
