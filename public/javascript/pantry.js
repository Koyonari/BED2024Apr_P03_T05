document.addEventListener("DOMContentLoaded", function () {
    let list = document.querySelector(".list");
    const accessToken = localStorage.getItem("AccessToken");
    const pantryId = localStorage.getItem("PantryID");
    const selectedIngredients = [];
  
    // Base URL for ingredient images
    const imageUrlBase = "https://img.spoonacular.com/ingredients_250x250/";
  
    // Fetch ingredients from the server
    function fetchIngredients() {
      fetch(`http://localhost:3500/pantry/${pantryId}/ingredients`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        }
      })
        .then(response => response.json())
        .then(data => {
          generateIngredients(data);
        })
        .catch(error => console.error('Error fetching ingredients:', error));
    }
  
    // Generate HTML for each ingredient
    function generateIngredients(products) {
      list.innerHTML = ""; // Clear the list before adding new items
      products.forEach((value) => {
        let newDiv = document.createElement("div");
        newDiv.classList.add("item");
        newDiv.dataset.ingredientId = value.ingredient_id; // Store ingredient_id
  
        // Check if ingredient is selected
        const isSelected = selectedIngredients.some(item => item.ingredient_id === value.ingredient_id);
  
        newDiv.innerHTML = `
          <img src="${imageUrlBase + value.ingredient_image}">
          <div class="title">${value.ingredient_name}</div>
          <div class="quantity">Quantity: ${value.quantity.toLocaleString()}</div>
          <input type="number" id="quantity-${value.ingredient_id}" placeholder="Enter amount">
          <button onclick="addToCard('${value.ingredient_id}')">Add Item</button>
          <button onclick="removeFromCard('${value.ingredient_id}')">Remove Item</button>
          <button onclick="toggleSelect('${value.ingredient_id}', '${value.ingredient_name}', this)" ${isSelected ? 'class="selected"' : ''}>${isSelected ? 'Selected' : 'Select Ingredient'}</button>`;
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
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ ingredient_id: ingredientId, quantity }) // Use the input quantity
      })
        .then(response => response.json())
        .then(data => {
          console.log('Ingredient added:', data);
          // Optionally, refresh the list or update the UI to reflect the change
          fetchIngredients(); // Refresh the ingredients list
        })
        .catch(error => console.error('Error adding ingredient:', error));
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
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ ingredient_id: ingredientId, quantity }) // Use the input quantity
      })
        .then(response => response.json())
        .then(data => {
          console.log('Ingredient removed:', data);
          // Optionally, refresh the list or update the UI to reflect the change
          fetchIngredients(); // Refresh the ingredients list
        })
        .catch(error => console.error('Error removing ingredient:', error));
    }
  
    // Function to toggle ingredient selection
    function toggleSelect(ingredientId, ingredientName, button) {
      const isSelected = selectedIngredients.some(item => item.ingredient_id === ingredientId);
      
      if (isSelected) {
        // Remove from selectedIngredients array
        selectedIngredients.splice(selectedIngredients.findIndex(item => item.ingredient_id === ingredientId), 1);
        button.classList.remove("selected");
        button.textContent = "Select Ingredient";
      } else {
        // Add to selectedIngredients array
        selectedIngredients.push({ ingredient_id: ingredientId, ingredient_name: ingredientName });
        button.classList.add("selected");
        button.textContent = "Selected";
      }
  
      console.log('Selected ingredients:', selectedIngredients);
    }
  
    // Fetch ingredients on page load
    fetchIngredients();
  
    // Expose functions to global scope
    window.addToCard = addToCard;
    window.removeFromCard = removeFromCard;
    window.toggleSelect = toggleSelect;
  });
  