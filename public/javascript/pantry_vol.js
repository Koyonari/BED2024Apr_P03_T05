document.addEventListener("DOMContentLoaded", (function () {
  // Create Global Variables
  let ingredient_list = document.querySelector(".ingredient_list");
  const accessToken = localStorage.getItem("AccessToken");
  const pantryId = localStorage.getItem("PantryID");
  const userId = localStorage.getItem('requestee_id');
  let selectedIngredients = [];

  // Base URL for ingredient images from Spoonacular API
  const imageUrlBase = "https://img.spoonacular.com/ingredients_500x500/";

  // Fetch ingredients from the server
  async function fetchIngredients() {
      try {
          const response = await fetch(`http://localhost:3500/pantry/${pantryId}/ingredients`, {
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
              },
          });
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
  async function addIngredientToRequest(requestId, pantryId, ingredientId) {
    try {
        const response = await fetch('http://localhost:3500/requests/inglist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ request_id: requestId, pantry_id: pantryId, ingredient_id: ingredientId })
        });

        if (response.status === 201) {
            const data = await response.json();
            console.log('Ingredient added successfully:', data);
        } else if (response.status === 409) {
            const data = await response.json();
            console.log('Ingredient already exists:', data.message);
        } else {
            const error = await response.json();
            console.error('Error adding ingredient:', error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    }
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
              <i id="delete_ingredient_icon" class='bx bxs-x-circle' onclick="deleteIngredient('${value.ingredient_id}')"></i>
              <img id="product_img" src="${imageUrlBase + value.ingredient_image}">
              <div class="title">${value.ingredient_name}</div>
              <div class="quantity">Quantity: ${value.quantity.toLocaleString()}</div>
              <div class="add_remove_holder">
                  <input type="number" min="0" id="quantity-${value.ingredient_id}" placeholder="Enter amount">
              </div>
              <button onclick="toggleSelect('${value.ingredient_id}', '${value.ingredient_name}', this)" ${isSelected ? 'class="selected"' : ""}>${isSelected ? "Selected" : "Select Ingredient"}</button>`;
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
          const response = await fetch(`http://localhost:3500/pantry/${pantryId}/addIngredientQuantity`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ ingredient_id: ingredientId, quantity }),
          });
          if (!response.ok) throw await response.json();
          const data = await response.json();
          console.log("Ingredient added:", data);
          fetchIngredients(); // Refresh the UI
      } catch (error) {
          handleError("Error adding ingredient:", error);
      }
  }

  // Function to delete an ingredient
  async function deleteIngredient(ingredientId) {
      try {
          const response = await fetch(`http://localhost:3500/pantry/${pantryId}/deleteIngredient`, {
              method: "DELETE",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ ingredient_id: ingredientId }),
          });
          if (!response.ok) throw await response.json();
          const data = await response.json();
          console.log("Ingredient deleted:", data);
          fetchIngredients(); // Fetch the ingredients again
      } catch (error) {
          handleError("Error deleting ingredient:", error);
      }
  }

  // Function to select ingredient and store their ID in an array of selectedIngredients
  function toggleSelect(ingredientId, ingredientName, button) {
    const quantityInput = document.getElementById(`quantity-${ingredientId}`);
    const quantity = parseInt(quantityInput.value, 10);
    const currentQuantity = parseInt(button.parentElement.querySelector('.quantity').textContent.split(': ')[1].replace(',', ''), 10);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Please input a valid quantity to donate.");
        return;
    }

    if (quantity > currentQuantity) {
        alert(`The quantity you entered (${quantity}) exceeds the available amount (${currentQuantity}). Please enter a lower quantity.`);
        return;
    }

    const isSelected = selectedIngredients.some(item => item.ingredient_id === ingredientId);

    if (isSelected) {
        selectedIngredients = selectedIngredients.filter(item => item.ingredient_id !== ingredientId);
        button.classList.remove("selected");
        button.textContent = "Select Ingredient";
    } else {
        selectedIngredients.push({
            ingredient_id: ingredientId,
            ingredient_name: ingredientName,
            quantity: quantity
        });
        button.classList.add("selected");
        button.textContent = "Selected";
    }

    console.log("Selected ingredients:", selectedIngredients);
}

  async function fetchPantryId(userId) {
      const response = await fetch(`http://localhost:3500/pantry/${userId}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
          }
      });

      if (!response.ok) {
          throw new Error(`Error fetching pantry ID: ${response.statusText}`);
      }

      const pantryData = await response.json();
      console.log(pantryData);
      return pantryData.pantry_id;
  }

  async function removeFromCard(ingredientId, quantity) {
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
        console.log(`Deducted ${quantity} of ingredient ${ingredientId} from volunteer's pantry:`, data);
        return data;
    } catch (error) {
        console.error("Error removing ingredient:", error);
        throw error;
    }
}

async function addToUserPantry(userPantryId, ingredient_name, quantity) {
    try {
        console.log(`Attempting to add ${quantity} of ingredient ${ingredient_name} to pantry ${userPantryId}`);
        const response = await fetch(`http://localhost:3500/pantry/${userPantryId}/ingredients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ ingredient_name, quantity }),
        });
        if (!response.ok) throw await response.json();
        const data = await response.json();
        console.log(`Added ${quantity} of ingredient ${ingredient_name} to user pantry:`, data);
        return data;
    } catch (error) {
        handleError("Error adding ingredient to user pantry:", error);
        throw error;
    }
}

async function processDonation() {
    if (selectedIngredients.length === 0) {
        alert("Please select at least one ingredient to donate.");
        return;
    }

    try {
        // Fetch the user's pantry ID
        const userPantryId = await fetchPantryId(userId);
        console.log("User's pantry ID:", userPantryId);

        for (const ingredient of selectedIngredients) {
            try {
                // Check if the selected quantity is still valid
                const ingredientElement = document.querySelector(`[data-ingredient-id="${ingredient.ingredient_id}"]`);
                const currentQuantity = parseInt(ingredientElement.querySelector('.quantity').textContent.split(': ')[1].replace(',', ''), 10);

                if (ingredient.quantity > currentQuantity) {
                    alert(`The selected quantity (${ingredient.quantity}) for ${ingredient.ingredient_name} exceeds the available amount (${currentQuantity}). Please refresh and try again.`);
                    return; // Stop the process if any ingredient quantity is invalid
                }

                // Deduct ingredients from volunteer's pantry
                console.log(`Removing ${ingredient.quantity} of ${ingredient.ingredient_name} from volunteer's pantry`);
                await removeFromCard(ingredient.ingredient_id, ingredient.quantity);

                // Add ingredients to user's pantry
                console.log(`Adding ${ingredient.quantity} of ${ingredient.ingredient_name} to user's pantry`);
                await addToUserPantry(userPantryId, ingredient.ingredient_name, ingredient.quantity);

                // Add ingredient to request
                console.log(`Adding ingredient ${ingredient.ingredient_id} to request`);
                const req_id = localStorage.getItem('request_id');
                console.log(req_id, userPantryId, ingredient.ingredient_id);
                await addIngredientToRequest(req_id, userPantryId, ingredient.ingredient_id);
            } catch (error) {
                console.error(`Error processing ingredient ${ingredient.ingredient_name}:`, error);
                throw error; // Re-throw to stop processing if an error occurs
            }
        }

        // Clear selected ingredients
        selectedIngredients = [];
        alert("Donation processed successfully!");
        fetchIngredients(); // Refresh the UI
    } catch (error) {
        handleError("Error processing donation:", error);
    }
}

  // Error handling utility
  function handleError(message, error) {
      console.error(message, error);
  }

  // Attach processDonation to the global scope for the button to access it
  window.processDonation = processDonation;
  window.deleteIngredient = deleteIngredient;
  window.toggleSelect = toggleSelect;
}));