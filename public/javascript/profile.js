var dietaryRestrictions = null;
var intolerances = null;
var excludedIngredients = null;


document.addEventListener("DOMContentLoaded", function () {
  const role = "Volunteer"; // This should be fetched from the database

  const profileData = {
    username: "john_doe",
    fullName: "John Doe",
    dob: "1990-01-01",
    address: "123 Main St, Anytown, USA",
    email: "john.doe@example.com",
    contact: "123-456-7890",
    password: "password123",
    role: role,
    dietaryRestrictions: ["Gluten Free", "Vegetarian"],
    intolerances: ["Seafood", "Dairy"],
    excludedIngredients: "Sugar, Salt",
  };

  populateProfileFields(profileData);
});

function populateProfileFields(profileData) {
  document.getElementById("username").value = profileData.username;
  document.getElementById("fullName").value = profileData.fullName;
  document.getElementById("dob").value = profileData.dob;
  document.getElementById("address").value = profileData.address;
  document.getElementById("email-signup").value = profileData.email;
  document.getElementById("contact").value = profileData.contact;
  document.getElementById("password-signup").value = profileData.password;
  document.getElementById("role").value = profileData.role;
  document.getElementById("excluded-ingredients").value = profileData.excludedIngredients;

profileData.dietaryRestrictions.forEach((restriction) => {
    const checkbox = document.querySelector(
        `#dietary-restrictions input[value="${restriction}"]`
    );
    if (checkbox) checkbox.checked = true;
});

profileData.intolerances.forEach((intolerance) => {
    const checkbox = document.querySelector(
        `#intolerances input[value="${intolerance}"]`
    );
    if (checkbox) checkbox.checked = true;
});

  if (profileData.role === "User") {
    document.getElementById("restrictions-btn").style.display = "block";
    document.getElementById("intolerances-btn").style.display = "block";
    document.getElementById("excluded-ingredients").style.display = "block";
    document.getElementById("excluded-ingredients-label").style.display = "block";
  } else {
    document.getElementById("restrictions-btn").style.display = "none";
    document.getElementById("intolerances-btn").style.display = "none";
    document.getElementById("excluded-ingredients").style.display = "none";
    document.getElementById("excluded-ingredients-label").style.display = "none";
  }
}


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