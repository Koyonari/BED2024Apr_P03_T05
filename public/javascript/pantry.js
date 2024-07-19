// Ng Kai Huat Jason - Pantry & Ingredients Functions
// Yeo Jin Rong - Recipes Functions

// On Page Load
document.addEventListener("DOMContentLoaded", function () {
  hideRecipeButton();

  // Create Global Variables
  let ingredient_list = document.querySelector(".ingredient_list");
  const accessToken = localStorage.getItem("AccessToken");
  const pantryId = localStorage.getItem("PantryID");
  const selectedIngredients = [];

  // Base URL for ingredient images from Spoonacular API
  const imageUrlBase = "https://img.spoonacular.com/ingredients_500x500/";

  // Fetch ingredients from the server
  function fetchIngredients() {
    fetch(`http://localhost:3500/pantry/${pantryId}/ingredients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.message || "Unknown error occurred");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.length === 0) {
          alert("No ingredients found.");
        } else {
          generateIngredients(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching ingredients:", error);
        alert(`Error fetching ingredients: ${error.message}`);
      });
  }

  fetchIngredients();

  // Generates a HTML Card for each ingredient retrieved from the server
  function generateIngredients(products) {
    ingredient_list.innerHTML = ""; // Clear the list before adding new items
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
      ingredient_list.appendChild(newDiv);
    });
  }

  // Function to add ingredient
  function addToCard(ingredientId) {
    // Gets quantity value from input field of respective ingredient
    const quantityInput = document.getElementById(`quantity-${ingredientId}`);
    const quantity = parseInt(quantityInput.value, 10);

    // Checks if quantity entered is more then 0
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity to add.");
      return;
    }

    // CALLS 
    fetch(`http://localhost:3500/pantry/${pantryId}/addIngredientQuantity`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ ingredient_id: ingredientId, quantity }), // Use the input quantity
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.message || "Unknown error occurred");
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Ingredient added:", data);

        // Calls fetchIngredients to refresh the UI
        fetchIngredients();
      })
      .catch((error) => {
        console.error("Error adding ingredient:", error);
        alert(`Error adding ingredient: ${error.message}`);
      });
  }

  // Function to deduct Ingredient Quantity
  function removeFromCard(ingredientId) {
    // Gets quantity value from input field of respective ingredient
    const quantityInput = document.getElementById(`quantity-${ingredientId}`);
    const quantity = parseInt(quantityInput.value, 10);

    // Checks if quantity entered is more then 0
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity to remove.");
      return;
    }

    // Calls PUT /pantry/:pantryId/ingredients to Server
    fetch(`http://localhost:3500/pantry/${pantryId}/deductIngredientQuantity`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ ingredient_id: ingredientId, quantity }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Ingredient removed:", data);

        // Calls fetchIngredients to refresh the UI
        fetchIngredients();
      })
      .catch((error) => console.error("Error removing ingredient:", error));
  }

  // Function to select ingredient and store their ID in a array of selectedIngredients
  function toggleSelect(ingredientId, ingredientName, button) {
    const isSelected = selectedIngredients.some(
      (item) => item.ingredient_id === ingredientId
    );

    if (isSelected) {
      // Remove from selectedIngredients array
      selectedIngredients.splice(
        selectedIngredients.findIndex(
          (item) => item.ingredient_id === ingredientId
        ),
        1
      );
      button.classList.remove("selected");
      button.textContent = "Select Ingredient";
    } else {
      // Add to selectedIngredients array
      selectedIngredients.push({
        ingredient_id: ingredientId,
        ingredient_name: ingredientName,
      });
      button.classList.add("selected");
      button.textContent = "Selected";
    }

    // Logs Ingredients for debugging
    console.log("Selected ingredients:", selectedIngredients);
  }

  // Function to Add a New Ingredient
  function addIngredient() {
    // Gets the Fields of the Add Ingredient Popup
    const ingredient_name = document.getElementById(
      "popup_IngredientName"
    ).value;
    const quantity = document.getElementById("popup_IngredientQuantity").value;

    // Regular expression to check if the ingredient name contains only letters and spaces
    const lettersAndSpacesOnly = /^[A-Za-z\s]+$/;

    // Checks for Empty Inputs and Alerts User
    if (ingredient_name === "" || quantity === "") {
      alert("Please fill in all fields");
      return;
    }

    // Validates that the ingredient name contains only letters
    if (!lettersAndSpacesOnly.test(ingredient_name)) {
      alert("Ingredient name should contain only letters");
      return;
    }

    // Calls POST /pantry/:pantryId/ingredients
    fetch(`http://localhost:3500/pantry/${pantryId}/ingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ ingredient_name, quantity }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.message);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Ingredient added:", data);
        // Get Ingredients and Make UI Changes
        fetchIngredients();

        // Clears popup fields and alerts user
        document.getElementById("popup_IngredientName").value = "";
        document.getElementById("popup_IngredientQuantity").value = "";
        alert("Ingredient Added Successfully");
      })
      .catch((error) => {
        // Alert of Error for debugging
        console.error("Error adding ingredient:", error);
        alert(`Ingredient Not Found: ${error.message}`);
      });
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Unknown error occurred");
      }

      const recipes = await response.json();
      console.log("Fetched recipes based on pantry ingredients:", recipes);
      alert("Recipes fetched, kindly navigate to recipes page to view.");
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert(`Error fetching recipes: ${error.message}`);
    }
  }

  // Function to get Filtered Recipes via selected Ingredients
  async function getFilteredRecipes(recipe_popup_id) {
    const recipe_popup = document.getElementById(recipe_popup_id);
    const recipe_list = recipe_popup.querySelector(".recipe_list");

    if (selectedIngredients.length === 0) {
      alert("Please select ingredients to filter recipes.");
      return;
    } else {
      togglepopup(recipe_popup_id);
      try {
        console.log(
          "Ingredients selected, fetching filtered recipes based on selected ingredients."
        );
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

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Unknown error occurred");
        }

        const filteredRecipes = await response.json();
        console.log("Fetched filtered recipes:", filteredRecipes);

        displayRecipes(filteredRecipes, recipe_list);
      } catch (error) {
        console.error("Error fetching filtered recipes:", error);
        alert(`Error fetching filtered recipes: ${error.message}`);
      }
    }
  }

  function displayRecipes(recipes, recipe_list) {
    // Clear previous content
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
      saveButton.dataset.recipe = JSON.stringify(recipe); // Store the recipe JSON as a string in a data attribute
      saveButton.addEventListener("click", () => saveRecipe(saveButton));

      recipeDetailsDiv.appendChild(recipeTitle);
      recipeDetailsDiv.appendChild(recipeDetails);
      recipeDetailsDiv.appendChild(saveButton);

      recipeDiv.appendChild(recipeImage);
      recipeDiv.appendChild(recipeDetailsDiv);
      recipe_list.appendChild(recipeDiv);
    });
  }

  function saveRecipe(button) {
    const recipe = JSON.parse(button.dataset.recipe); // Parse the JSON string back into an object
    console.log("Saving recipe:", recipe);
    // Add your save functionality here
    // For example, you could send the recipe object to your server or store it locally
  }

  // Expose functions to global scope
  window.addToCard = addToCard;
  window.removeFromCard = removeFromCard;
  window.toggleSelect = toggleSelect;
  window.togglepopup = togglepopup;
  window.addIngredient = addIngredient;
  window.getRecipes = getRecipes;
  window.getFilteredRecipes = getFilteredRecipes;
});

// function to hide recipe button if user is a volunteer
function hideRecipeButton() {
  const userInfo = JSON.parse(localStorage.getItem("UserInfo"));
  const roles = userInfo.roles;
  if (roles.includes(2002)) {
    document.getElementById("recipes_btn").style.display = "none";
  }
}
