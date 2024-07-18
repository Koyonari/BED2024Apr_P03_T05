// Yeo Jin Rong

// Create Global Variables
var dietaryRestrictions = null; 
var intolerances = null; 
var excludedIngredients = null; 

// Diet Restrictions Popup
// Show the diet restrictions popup when the button is clicked
document
  .getElementById("restrictions-btn")
  .addEventListener("click", function () {
    document.getElementById("restrictions-container").classList.add("active");
  });

// Close the diet restrictions popup when the close button is clicked
document
  .getElementById("restrictions-close-btn")
  .addEventListener("click", function () {
    document
      .getElementById("restrictions-container")
      .classList.remove("active");
  });

// Intolerances Popup
// Show the intolerances popup when the button is clicked
document
  .getElementById("intolerances-btn")
  .addEventListener("click", function () {
    document.getElementById("intolerances-container").classList.add("active");
  });

// Close the intolerances popup when the close button is clicked
document
  .getElementById("intolerances-close-btn")
  .addEventListener("click", function () {
    document
      .getElementById("intolerances-container")
      .classList.remove("active");
  });

//Push Diet to dietaryRestrictions
// Store the selected dietary restrictions in the dietaryRestrictions array
document
  .getElementById("restrictions-btn")
  .addEventListener("click", function () {
    var options = document.getElementById("dietary-restrictions").options;
    dietaryRestrictions = [];
    for (var i = 0; i < options.length; i++) {
      if (options[i].selected) {
        dietaryRestrictions.push(options[i].value);
      }
    }
    // Display the selected restrictions in the popup
    alert("Selected Restrictions: " + dietaryRestrictions.join(", "));
  });

// Push Intolerances to intolerances array
// Store the selected intolerances in the intolerances array
document
  .getElementById("intolerances-btn")
  .addEventListener("click", function () {
    var options = document.getElementById("intolerances").options;
    intolerances = [];
    for (var i = 0; i < options.length; i++) {
      if (options[i].selected) {
        intolerances.push(options[i].value);
      }
    }
    // Display the selected intolerances in the popup
    alert("Selected Intolerances: " + intolerances.join(", "));
  });

// Confirms Diet Restrictions and stores in a array
// Store the selected dietary restrictions in the dietaryRestrictions array
document
  .getElementById("confirm-diet-btn")
  .addEventListener("click", function () {
    // Get the checked checkboxes
    let checkboxes = document.querySelectorAll(
      'input[name="dietary-restriction"]:checked'
    );
    dietaryRestrictions = [];
    checkboxes.forEach(function (checkbox) {
      dietaryRestrictions.push(checkbox.value);
    });
    console.log("Selected Dietary Restrictions:", dietaryRestrictions);

    // Close the restrictions container
    document
      .getElementById("restrictions-container")
      .classList.remove("active");
  });

// Confirms Intolerances and stores in a array
// Store the selected intolerances in the intolerances array
document
  .getElementById("confirm-int-btn")
  .addEventListener("click", function () {
    // Get the checked checkboxes
    let checkboxes = document.querySelectorAll(
      'input[name="intolerances"]:checked'
    );
    intolerances = [];
    checkboxes.forEach(function (checkbox) {
      intolerances.push(checkbox.value);
    });
    console.log("Selected Intolerances:", intolerances);

    // Close the intolerances container
    document
      .getElementById("intolerances-container")
      .classList.remove("active");
  });

// Create User
// Handle form submission
document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form submission

  // Get user input values
  var username = document.getElementById("username").value.trim();
  var firstname = document.getElementById("firstname").value.trim();
  var lastname = document.getElementById("lastname").value.trim();
  var dob = document.getElementById("dob").value.trim();
  var password = document.getElementById("password-signup").value.trim();
  var address = document.getElementById("address").value.trim();
  var email = document.getElementById("email-signup").value.trim();
  var contact = document.getElementById("contact").value.trim();
  var role = document.getElementById("role").value.trim();
  var excludedIngredients = document
    .getElementById("excluded-ingredients")
    .value.trim();

  // Check for Empty Fields
  if (
    !username ||
    !firstname ||
    !lastname ||
    !dob ||
    !password ||
    !address ||
    !email ||
    !contact ||
    !role
  ) {
    alert("Please fill out all required fields.");
    return;
  }

  // Password validation
  var passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordPattern.test(password)) {
    alert(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );
    return;
  }

  // Set dietaryRestrictions to null if empty
  if (dietaryRestrictions && dietaryRestrictions.length === 0) {
    dietaryRestrictions = null;
  }

  // Set intolerances to null if empty
  if (intolerances && intolerances.length === 0) {
    intolerances = null;
  }

  // Split excludedIngredients by comma and trim whitespace
  if (excludedIngredients && excludedIngredients.length > 0) {
    excludedIngredients = excludedIngredients
      .split(",")
      .map(function (ingredient) {
        return ingredient.trim();
      });
  } else {
    excludedIngredients = null;
  }

  // Create user object to match MongoDB Schema
  var user = {
    username: username,
    firstname: firstname,
    lastname: lastname,
    roles: {
      User: 2001,
    },
    password: password,
    address: address,
    dietaryRestrictions: dietaryRestrictions,
    intolerances: intolerances,
    excludedIngredients: excludedIngredients,
    email: email,
    contact: contact,
    dateOfBirth: dob,
  };

  // Send the data to the server for processing
  fetch('http://localhost:3500/register', {
    method: 'POST',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json().then(data => ({status: response.status, body: data})))
  .then(({status, body}) => {
    if (status === 201) {
      console.log('Success:', body);
      alert("Register successful, you can now login via the login page.");
      // Reset form fields
      document.querySelector("form").reset();
    } else {
      console.error('Error:', body);
      alert("There was an error creating the user: " + body.message);
    }
  })
  .catch((error) => {
    console.error('Error:', error);
    alert("There was an error creating the user.");
  });
});
