var dietaryRestrictions = null;
var intolerances = null;
var excludedIngredients = null;

document.addEventListener("DOMContentLoaded", async function () {
  console.log("DOMContentLoaded event triggered");
  try {
    // Retrieve tokens and user ID from localStorage
    const accessToken = localStorage.getItem("AccessToken");
    const userId = JSON.parse(localStorage.getItem("UserInfo")).userid;

    console.log(`Fetching profile data for user: ${userId}`);

    // Fetch user profile data
    const response = await fetch(`http://localhost:3500/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching user data: ${response.statusText}`);
    }

    const profileData = await response.json();

    console.log("Profile data fetched: ", profileData);
    populateProfileFields(profileData);
  } catch (error) {
    console.error(error);
    alert("Failed to load profile data.");
  }
});

function populateProfileFields(profileData) {
  console.log("Populating profile fields");
  document.getElementById("username").value = profileData.username;
  document.getElementById("firstName").value = profileData.firstname;
  document.getElementById("lastName").value = profileData.lastname;

  const dobString = profileData.dateOfBirth; // Assuming profileData.dateOfBirth is in ISO format
  const dateParts = dobString.split("T")[0];
  // Constructing the formatted date
  document.getElementById("dob").value = dateParts;

  // Extracting the role name
  const roleName = Object.keys(profileData.roles).find(
    (key) => profileData.roles[key] === 2001
  );
  document.getElementById("role").value = roleName;

  document.getElementById("address").value = profileData.address;
  document.getElementById("email-signup").value = profileData.email;
  document.getElementById("contact").value = profileData.contact;
  document.getElementById("password-signup").value = profileData.password;

  // Assuming profileData.roles is a Map object where key is the role name and value is the role ID

  document.getElementById("excluded-ingredients").value =
    profileData.excludedIngredients.join(", ");

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

  if (roleName == "User") {
    document.getElementById("restrictions-btn").style.display = "block";
    document.getElementById("intolerances-btn").style.display = "block";
    document.getElementById("excluded-ingredients").style.display = "block";
    document.getElementById("excluded-ingredients-label").style.display =
      "block";
  } else {
    document.getElementById("restrictions-btn").style.display = "none";
    document.getElementById("intolerances-btn").style.display = "none";
    document.getElementById("excluded-ingredients").style.display = "none";
    document.getElementById("excluded-ingredients-label").style.display =
      "none";
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
