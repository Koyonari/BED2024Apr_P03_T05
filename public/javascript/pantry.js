document.addEventListener("DOMContentLoaded", function () {
  let list = document.querySelector(".list");
  const accessToken = localStorage.getItem("AccessToken");
  const pantryId = localStorage.getItem("PantryID");
  const selectedIngredients = [];

  // Base URL for ingredient images
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

  // Generate HTML for each ingredient
  function generateIngredients(products) {
    list.innerHTML = ""; // Clear the list before adding new items
    products.forEach((value) => {
      let newDiv = document.createElement("div");
      newDiv.classList.add("item");
      newDiv.dataset.ingredientId = value.ingredient_id; // Store ingredient_id

      // Check if ingredient is selected
      const isSelected = selectedIngredients.some(
        (item) => item.ingredient_id === value.ingredient_id
      );

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
      list.appendChild(newDiv);
    });
  }

  // Function to add ingredient
  function addToCard(ingredientId) {
    const quantityInput = document.getElementById(`quantity-${ingredientId}`);
    const quantity = parseInt(quantityInput.value, 10);

    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity to add.");
      return;
    }

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
        // Optionally, refresh the list or update the UI to reflect the change
        fetchIngredients(); // Refresh the ingredients list
      })
      .catch((error) => console.error("Error adding ingredient:", error));
  }

  // Function to remove ingredient
  function removeFromCard(ingredientId) {
    const quantityInput = document.getElementById(`quantity-${ingredientId}`);
    const quantity = parseInt(quantityInput.value, 10);

    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity to remove.");
      return;
    }

    fetch(`http://localhost:3500/pantry/${pantryId}/ingredients`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ ingredient_id: ingredientId, quantity }), // Use the input quantity
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Ingredient removed:", data);
        // Optionally, refresh the list or update the UI to reflect the change
        fetchIngredients(); // Refresh the ingredients list
      })
      .catch((error) => console.error("Error removing ingredient:", error));
  }

  // Function to toggle ingredient selection
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

    console.log("Selected ingredients:", selectedIngredients);
  }

  // Function to Add a New Ingredient
  function addIngredient() {
    const ingredient_name = document.getElementById(
      "popup_IngredientName"
    ).value;
    const quantity = document.getElementById("popup_IngredientQuantity").value;

    if (ingredient_name === "" || quantity === "") {
      alert("Please fill in all fields");
      return;
    } else {
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
          document.getElementById("popup_IngredientName").value = "";
          document.getElementById("popup_IngredientQuantity").value = "";
          alert("Ingredient Added Successfully");
        })
        .catch((error) => {
          console.error("Error adding ingredient:", error);
          alert(`Error adding ingredient: ${error.message}`);
        });
    }
  }

  // Function to toggle Add Ingredient Popup
  function togglepopup(popupid) {
    document.getElementById(popupid).classList.toggle("active");
  }

  // Fetch ingredients on page load
  fetchIngredients();

  // Expose functions to global scope
  window.addToCard = addToCard;
  window.removeFromCard = removeFromCard;
  window.toggleSelect = toggleSelect;
  window.togglepopup = togglepopup;
  window.addIngredient = addIngredient;
});
