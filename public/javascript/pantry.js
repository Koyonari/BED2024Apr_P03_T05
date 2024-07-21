// Ng Kai Huat Jason - Pantry & Ingredients Functions
// Yeo Jin Rong - Recipes Functions

document.addEventListener(
  "DOMContentLoaded",
  (function () {
    hideRecipeButton();

    // Create Global Variables
    let ingredient_list = document.querySelector(".ingredient_list");
    const accessToken = localStorage.getItem("AccessToken");
    const pantryId = localStorage.getItem("PantryID");
    const selectedIngredients = [];

    // Base URL for ingredient images from Spoonacular API
    const imageUrlBase = "https://img.spoonacular.com/ingredients_500x500/";

    // Fetch ingredients from the server
    async function fetchIngredients() {
      try {
        const response = await fetch(
          `http://localhost:3500/pantry/${pantryId}/ingredients`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) throw await response.json();
        const data = await response.json();
        if (data.length === 0) {
          alert("No ingredients found.");
          ingredient_list.innerHTML = ""; // Clear the ingredient list
          return;
        }
        generateIngredients(data);
      } catch (error) {
        handleError("Error fetching ingredients:", error);
      }
    }

    fetchIngredients();

    // Generates a HTML Card for each ingredient retrieved from the server
    function generateIngredients(products) {
      ingredient_list.innerHTML = ""; // Clear the list before adding new items
      const fragment = document.createDocumentFragment(); // Use a document fragment for batching

      products.forEach((value) => {
        let newDiv = document.createElement("div");
        newDiv.classList.add("item");
        newDiv.dataset.ingredientId = value.ingredient_id; // Store ingredient_id

        // Check if ingredient is selected
        const isSelected = selectedIngredients.some(
          (item) => item.ingredient_id === value.ingredient_id
        );

        // The Ingredient Card will store the Ingredient ID, Ingredient Name, Quantity, Image
        newDiv.innerHTML = `
        <i id="delete_ingredient_icon" class='bx bxs-x-circle' onclick="deleteIngredient('${
          value.ingredient_id
        }')"></i>
        <img id="product_img" src="${imageUrlBase + value.ingredient_image}">
        <div class="title">${value.ingredient_name}</div>
        <div class="quantity">Quantity: ${value.quantity.toLocaleString()}</div>
        <div class="add_remove_holder">
          <i id="ingredient_minus_icon" class='bx bxs-minus-circle' onclick="removeFromCard('${
            value.ingredient_id
          }')"></i>
          <input type="number" min="0" id="quantity-${
            value.ingredient_id
          }" placeholder="Enter amount">
          <i id="ingredient_plus_icon" class='bx bxs-plus-circle' onclick="addToCard('${
            value.ingredient_id
          }')"></i>
        </div>
        <button onclick="toggleSelect('${value.ingredient_id}', '${
          value.ingredient_name
        }', this)" ${isSelected ? 'class="selected"' : ""}>${
          isSelected ? "Selected" : "Select Ingredient"
        }</button>`;
        fragment.appendChild(newDiv);
      });

      ingredient_list.appendChild(fragment); // Append fragment to DOM
    }

    // Function to add ingredient Quantity
    async function addToCard(ingredientId) {
      const quantityInput = document.getElementById(`quantity-${ingredientId}`);
      const quantity = parseInt(quantityInput.value, 10);

      if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity to add.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3500/pantry/${pantryId}/addIngredientQuantity`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ ingredient_id: ingredientId, quantity }),
          }
        );
        if (!response.ok) throw await response.json();
        const data = await response.json();
        console.log("Ingredient added:", data);
        fetchIngredients(); // Refresh the UI
      } catch (error) {
        handleError("Error adding ingredient:", error);
      }
    }

    // Function to deduct Ingredient Quantity
    async function removeFromCard(ingredientId) {
      const quantityInput = document.getElementById(`quantity-${ingredientId}`);
      const quantity = parseInt(quantityInput.value, 10);

      if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity to remove.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3500/pantry/${pantryId}/deductIngredientQuantity`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ ingredient_id: ingredientId, quantity }),
          }
        );
        if (!response.ok) throw await response.json();
        const data = await response.json();
        console.log("Ingredient removed:", data);
        fetchIngredients(); // Refresh the UI
      } catch (error) {
        handleError("Error removing ingredient:", error);
      }
    }

    // Function to delete an ingredient
    async function deleteIngredient(ingredientId) {
      try {
        const response = await fetch(
          `http://localhost:3500/pantry/${pantryId}/deleteIngredient`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ ingredient_id: ingredientId }),
          }
        );
        if (!response.ok) throw await response.json();
        const data = await response.json();
        console.log("Ingredient deleted:", data);
        alert("Ingredient deleted successfully.");
        fetchIngredients(); // Fetch the ingredients again
      } catch (error) {
        handleError("Error deleting ingredient:", error);
      }
    }

    // Function to select ingredient and store their ID in an array of selectedIngredients
    function toggleSelect(ingredientId, ingredientName, button) {
      const isSelected = selectedIngredients.some(
        (item) => item.ingredient_id === ingredientId
      );

      if (isSelected) {
        selectedIngredients.splice(
          selectedIngredients.findIndex(
            (item) => item.ingredient_id === ingredientId
          ),
          1
        );
        button.classList.remove("selected");
        button.textContent = "Select Ingredient";
      } else {
        selectedIngredients.push({
          ingredient_id: ingredientId,
          ingredient_name: ingredientName,
        });
        button.classList.add("selected");
        button.textContent = "Selected";
      }

      console.log("Selected ingredients:", selectedIngredients);
    }

    // Function to Add a New Ingredient
    async function addIngredient() {
      const ingredient_name = document.getElementById(
        "popup_IngredientName"
      ).value;
      const quantity = document.getElementById(
        "popup_IngredientQuantity"
      ).value;

      const lettersAndSpacesOnly = /^[A-Za-z\s]+$/;

      if (ingredient_name === "" || quantity === "") {
        alert("Please fill in all fields");
        return;
      }

      if (!lettersAndSpacesOnly.test(ingredient_name)) {
        alert("Ingredient name should contain only letters");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3500/pantry/${pantryId}/ingredients`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ ingredient_name, quantity }),
          }
        );
        if (!response.ok) throw await response.json();
        const data = await response.json();
        console.log("Ingredient added:", data);
        fetchIngredients(); // Get Ingredients and Make UI Changes
        document.getElementById("popup_IngredientName").value = "";
        document.getElementById("popup_IngredientQuantity").value = "";
        alert("Ingredient Added Successfully");
      } catch (error) {
        handleError("Ingredient Not Found:", error);
      }
    }

    // Function to toggle Popup
    function togglepopup(popupid) {
      document.getElementById(popupid).classList.toggle("active");
    }

    // Function to get Recipe
    async function getRecipes() {
      try {
        const response = await fetch(`http://localhost:3500/recipes/fetch`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) throw await response.json();
        const recipes = await response.json();
        console.log("Fetched recipes based on pantry ingredients:", recipes);
        alert("Recipes fetched, kindly navigate to recipes page to view.");
      } catch (error) {
        handleError("Error fetching recipes:", error);
      }
    }

    // Function to get Filtered Recipes via selected Ingredients
    async function getFilteredRecipes(recipe_popup_id) {
      const recipe_popup = document.getElementById(recipe_popup_id);
      const recipe_list = recipe_popup.querySelector(".recipe_list");

      if (selectedIngredients.length === 0) {
        alert("Please select ingredients to filter recipes.");
        return;
      }

      togglepopup(recipe_popup_id);

      try {
        const response = await fetch(
          `http://localhost:3500/recipes/getfilteredrecipes`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(selectedIngredients),
          }
        );
        if (!response.ok) throw await response.json();
        const filteredRecipes = await response.json();
        console.log("Fetched filtered recipes:", filteredRecipes);
        displayRecipes(filteredRecipes, recipe_list);
      } catch (error) {
        handleError("Error fetching filtered recipes:", error);
      }
    }

    // Function to display recipes
    function displayRecipes(recipes, recipe_list) {
      recipe_list.innerHTML = "";

      recipes.forEach((recipe) => {
        const recipeDiv = document.createElement("div");
        recipeDiv.classList.add("recipe");

        const recipeImage = document.createElement("img");
        recipeImage.src = recipe.imageurl;
        recipeImage.alt = recipe.title;

        const recipeDetailsDiv = document.createElement("div");

        const recipeTitle = document.createElement("h3");
        recipeTitle.textContent = recipe.title;

        const recipeDetails = document.createElement("p");
        recipeDetails.innerHTML = `
        Servings: ${recipe.servings}<br>
        Ready in: ${recipe.readyInMinutes} minutes<br>
        Price per serving: $${(recipe.pricePerServing / 100).toFixed(2)}
      `;

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.dataset.recipe = JSON.stringify(recipe);
        saveButton.addEventListener("click", () => saveRecipe(saveButton));

        recipeDetailsDiv.appendChild(recipeTitle);
        recipeDetailsDiv.appendChild(recipeDetails);
        recipeDetailsDiv.appendChild(saveButton);

        recipeDiv.appendChild(recipeImage);
        recipeDiv.appendChild(recipeDetailsDiv);
        recipe_list.appendChild(recipeDiv);
      });
    }

    // Function to save a recipe
    // Function to save a recipe
    async function saveRecipe(button) {
      const recipe = JSON.parse(button.dataset.recipe);
      console.log("Saving recipe:", recipe);

      // Wrap the recipe object in an array
      const recipeArray = [recipe];

      try {
        const response = await fetch(
          "http://localhost:3500/recipes/insertrecipe",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            // Send the array instead of a single object
            body: JSON.stringify(recipeArray),
          }
        );

        if (!response.ok) throw await response.json();

        const data = await response.json();
        console.log("Recipe saved successfully:", data);
        alert("Recipe saved successfully.");
      } catch (error) {
        console.error("Error saving recipe:", error);
        alert(`Error saving recipe: ${error.message}`);
      }
    }

    // Error handling utility
    function handleError(message, error) {
      console.error(message, error);
      alert(`${message} ${error.message}`);
    }

    // Expose functions to global scope
    window.addToCard = addToCard;
    window.removeFromCard = removeFromCard;
    window.toggleSelect = toggleSelect;
    window.togglepopup = togglepopup;
    window.addIngredient = addIngredient;
    window.getRecipes = getRecipes;
    window.getFilteredRecipes = getFilteredRecipes;
    window.deleteIngredient = deleteIngredient;

    // Function to hide recipe button if user is a volunteer
    function hideRecipeButton() {
      const userInfo = JSON.parse(localStorage.getItem("UserInfo"));
      const roles = userInfo.roles;
      if (roles.includes(2002)) {
        document.getElementById("recipes_btn").style.display = "none";
      }
    }
  })()
);
