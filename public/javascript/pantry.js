// Ng Kai Huat Jason

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
      .then((response) => response.json())
      .then((data) => {
        generateIngredients(data);
      })
      .catch((error) => console.error("Error fetching ingredients:", error));
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

    // Calls POST /addIngredients to Server
    fetch(`http://localhost:3500/pantry/${pantryId}/addingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ ingredient_id: ingredientId, quantity }), // Use the input quantity
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Ingredient added:", data);

        // Calls fetchIngredients to refresh the UI
        fetchIngredients();
      })
      .catch((error) => console.error("Error adding ingredient:", error));
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

    // Calls DELETE /pantry/:pantryId/ingredients to Server
    fetch(`http://localhost:3500/pantry/${pantryId}/ingredients`, {
      method: "DELETE",
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

    // Checks for Empty Inputs and Alerts User
    if (ingredient_name === "" || quantity === "") {
      alert("Please fill in all fields");
      return;
    } else {
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
          alert(`Error adding ingredient: ${error.message}`);
        });
    }
  }

  // Function to toggle Popup
  function togglepopup(popupid) {
    document.getElementById(popupid).classList.toggle("active");
  }
  

  // Expose functions to global scope
  window.addToCard = addToCard;
  window.removeFromCard = removeFromCard;
  window.toggleSelect = toggleSelect;
  window.togglepopup = togglepopup;
  window.addIngredient = addIngredient;
});



// function to hide recipe button if user is a volunteer
function hideRecipeButton() {
  const userInfo = JSON.parse(localStorage.getItem("UserInfo"));
  const roles = userInfo.roles;
  if (roles.includes(2002)) {
    document.getElementById("recipes_btn").style.display = "none";
  }
}
