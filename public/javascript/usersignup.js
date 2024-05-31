var dietaryRestrictions = null;
var intolerances = null;

///////////////////////////////////////////////// Diet Restrictions Popup
document
  .getElementById("restrictions-btn")
  .addEventListener("click", function () {
    document.getElementById("restrictions-container").classList.add("active");
  });

document
  .getElementById("restrictions-close-btn")
  .addEventListener("click", function () {
    document
      .getElementById("restrictions-container")
      .classList.remove("active");
  });
/////////////////////////////////////////////////

///////////////////////////////////////////////// Intolerances Popup
document
  .getElementById("intolerances-btn")
  .addEventListener("click", function () {
    document.getElementById("intolerances-container").classList.add("active");
  });

document
  .getElementById("intolerances-close-btn")
  .addEventListener("click", function () {
    document
      .getElementById("intolerances-container")
      .classList.remove("active");
  });
/////////////////////////////////////////////////

///////////////////////////////////////////////// Push Diet to dietaryRestrictions
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
    // Display the selected restrictions in the popup or do whatever you want with them
    alert("Selected Restrictions: " + dietaryRestrictions.join(", "));
  });

///////////////////////////////////////////////// Push Intolerances to intolerances
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
    // Display the selected intolerances in the popup or do whatever you want with them
    alert("Selected Intolerances: " + intolerances.join(", "));
  });
/////////////////////////////////////////////////

///////////////////////////////////////////////// Confirm Diet Restrictions
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
/////////////////////////////////////////////////

///////////////////////////////////////////////// Confirm Intolerances
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

/////////////////////////////////////////////////



///////////////////////////////////////////////// Create User
document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form submission

  // Get user input values
  var Username = document.getElementById("username").value.trim();
  var Fullname = document.getElementById("Fullname").value.trim();
  var dob = document.getElementById("dob").value.trim();
  var address = document.getElementById("address").value.trim();
  var email = document.getElementById("email-signup").value.trim();
  var contact = document.getElementById("contact").value.trim();
  var password = document.getElementById("password-signup").value.trim();
  var role = document.getElementById("role").value.trim();

  // Basic form validation
  if (!Username || !Fullname || !dob || !address || !email || !contact || !password || !role) {
    alert("Please fill out all required fields.");
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

  // Create user object
  var user = {
    Username: Username,
    Fullname: Fullname,
    dob: dob,
    address: address,
    email: email,
    contact: contact,
    password: password,
    role: role,
    dietaryRestrictions: dietaryRestrictions,
    intolerances: intolerances
  };

  // Optionally, you can send this data to the server for processing
  // For example, using fetch to send the data to a server endpoint
  /* fetch('https://your-api-endpoint', {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    }); */

  // Reset form fields
  document.querySelector("form").reset();

  // Display success message or redirect to another page
  console.log(user);
  alert("User created successfully!");
});
/////////////////////////////////////////////////
