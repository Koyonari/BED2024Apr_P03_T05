// Yeo Jin Rong
// On page load
document.addEventListener("DOMContentLoaded", async function () {
  console.log("DOMContentLoaded event triggered");
  await fetchUser();
  getCurrentProfile();
});

// Diet Restrictions Popup
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

// Intolerances Popup
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

// Confirm Diet Restrictions
document
  .getElementById("confirm-diet-btn")
  .addEventListener("click", function () {
    // Get the checked dietary restrictions and push them to a array
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

// Confirm Intolerances
document
  .getElementById("confirm-int-btn")
  .addEventListener("click", function () {
    // Get the checked intolerances and push them to a array
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

// Fetch User via User ID
async function fetchUser() {
  try {
    // Retrieves the user's access token and user ID from local storage
    const accessToken = localStorage.getItem("AccessToken");
    const userId = JSON.parse(localStorage.getItem("UserInfo")).userid;

    // Log which user ID its sending to the server
    console.log(`Fetching profile data for user: ${userId}`);

    const response = await fetch(`http://localhost:3500/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Log any errors if the response is not okay
    if (!response.ok) {
      throw new Error(`Error fetching user data: ${response.statusText}`);
    }

    const profileData = await response.json();

    // Log the profile data fetched
    console.log("Profile data fetched: ", profileData);
    populateProfileFields(profileData);
  } catch (error) {
    console.error(error);
    alert("Failed to load profile data.");
  }
}

// Fill form with user data which will be ran within fetchUser()
// This functions gets all the field inputs and fills them with the user's data
function populateProfileFields(profileData) {
  console.log("Populating profile fields");
  document.getElementById("username").value = profileData.username;
  document.getElementById("firstName").value = profileData.firstname;
  document.getElementById("lastName").value = profileData.lastname;
  document.getElementById("dob").value = profileData.dateOfBirth.split("T")[0];
  document.getElementById("role").value = Object.keys(profileData.roles).find(
    (key) =>
      profileData.roles[key] === 2001 ||
      profileData.roles[key] === 2002 ||
      profileData.roles[key] === 2003
  );
  document.getElementById("address").value = profileData.address;
  document.getElementById("email").value = profileData.email;
  document.getElementById("contact").value = profileData.contact;
  document.getElementById("password").value = "";
  document.getElementById("excluded-ingredients").value =
    profileData.excludedIngredients.join(", ");

  profileData.dietaryRestrictions.forEach((restriction) => {
    const checkbox = document.querySelector(
      `input[name="dietary-restriction"][value="${restriction}"]`
    );
    if (checkbox) checkbox.checked = true;
  });

  profileData.intolerances.forEach((intolerance) => {
    const checkbox = document.querySelector(
      `input[name="intolerances"][value="${intolerance}"]`
    );
    if (checkbox) checkbox.checked = true;
  });

  const roleName = document.getElementById("role").value;
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

// Store Current Profile Data
// uses the data from fetchUser() and stores it in a global variable to compare for editProfile & updateProfile
function getCurrentProfile() {
  try {
    currentUserProfile = {
      username: document.getElementById("username").value,
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      dob: document.getElementById("dob").value,
      role: document.getElementById("role").value,
      address: document.getElementById("address").value,
      email: document.getElementById("email").value,
      contact: document.getElementById("contact").value,
      password: document.getElementById("password").value, // This password is ""
    };

    if (currentUserProfile.role === "User") {
      currentUserProfile.excludedIngredients = document
        .getElementById("excluded-ingredients")
        .value.split(", ")
        .map((ingredient) => ingredient.trim());

      currentUserProfile.dietaryRestrictions = [];
      document
        .querySelectorAll('input[name="dietary-restriction"]:checked')
        .forEach((checkbox) => {
          currentUserProfile.dietaryRestrictions.push(checkbox.value);
        });

      currentUserProfile.intolerances = [];
      document
        .querySelectorAll('input[name="intolerances"]:checked')
        .forEach((checkbox) => {
          currentUserProfile.intolerances.push(checkbox.value);
        });
    }

    console.log("Current Profile:", currentUserProfile);
  } catch (error) {
    console.error("Error storing current profile:", error);
    alert("Failed to store current profile.");
  }
}

// Get confirm changes button
document
  .getElementById("confirm-changes-btn")
  .addEventListener("click", function () {
    checkAllProfileChanged();
  });

// Uses the current profile data stored and compares it with the fields on the front end and checks for any updates
// So if the field values doesn't match the current profile data, it will add it to a object called updates
function checkAllProfileChanged() {
  let updates = {};

  // Check each field to see if it has changed
  if (
    document.getElementById("username").value !== currentUserProfile.username
  ) {
    updates.username = document.getElementById("username").value;
  }
  if (
    document.getElementById("firstName").value !== currentUserProfile.firstName
  ) {
    updates.firstname = document.getElementById("firstName").value;
  }
  if (
    document.getElementById("lastName").value !== currentUserProfile.lastName
  ) {
    updates.lastname = document.getElementById("lastName").value;
  }
  if (document.getElementById("dob").value !== currentUserProfile.dob) {
    updates.dateOfBirth = document.getElementById("dob").value;
  }
  if (document.getElementById("address").value !== currentUserProfile.address) {
    updates.address = document.getElementById("address").value;
  }
  if (document.getElementById("email").value !== currentUserProfile.email) {
    updates.email = document.getElementById("email").value;
  }
  if (document.getElementById("contact").value !== currentUserProfile.contact) {
    updates.contact = document.getElementById("contact").value;
  }
  if (document.getElementById("password").value !== "") {
    updates.password = document.getElementById("password").value;
  }

  // Checks if the user is a "User" role and checks for any changes in the dietary restrictions,
  // intolerances and excluded ingredients
  if (currentUserProfile.role === "User") {
    let excludedIngredients = document
      .getElementById("excluded-ingredients")
      .value.split(", ")
      .map((ingredient) => ingredient.trim());
    if (
      excludedIngredients.toString() !==
      currentUserProfile.excludedIngredients.toString()
    ) {
      updates.excludedIngredients = excludedIngredients;
    }

    let dietaryRestrictions = [];
    document
      .querySelectorAll('input[name="dietary-restriction"]:checked')
      .forEach((checkbox) => {
        dietaryRestrictions.push(checkbox.value);
      });
    if (
      dietaryRestrictions.toString() !==
      currentUserProfile.dietaryRestrictions.toString()
    ) {
      updates.dietaryRestrictions = dietaryRestrictions;
    }

    let intolerances = [];
    document
      .querySelectorAll('input[name="intolerances"]:checked')
      .forEach((checkbox) => {
        intolerances.push(checkbox.value);
      });
    if (
      intolerances.toString() !== currentUserProfile.intolerances.toString()
    ) {
      updates.intolerances = intolerances;
    }
  }

  // This will check the update object created(new user inputs) and compare it with the current profile data
  // via their object key length , if the length is the same, means all data were changed and will call
  // PUT updateProfile() else it will call PATCH editProfile() to update the data
  if (
    Object.keys(updates).length ===
    Object.keys(currentUserProfile).length - 1
  ) {
    console.log("Calling PUT");
    updateProfile(); // Use PUT
  } else {
    console.log("Calling PATCH");
    editProfile(updates); // Use PATCH
  }
}

// Update Profile (PUT)
async function updateProfile() {
  try {
    const accessToken = localStorage.getItem("AccessToken");
    const userId = JSON.parse(localStorage.getItem("UserInfo")).userid;

    console.log(`Updating profile data for user: ${userId}`);

    let profile = {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value || "defaultPassword",
      firstname: document.getElementById("firstName").value,
      lastname: document.getElementById("lastName").value,
      roles: {
        [document.getElementById("role").value]: getRoleCode(
          document.getElementById("role").value
        ),
      },
      address: document.getElementById("address").value,
      email: document.getElementById("email").value,
      contact: document.getElementById("contact").value,
      dateOfBirth: document.getElementById("dob").value,
    };

    // Log profile data before sending
    console.log("Profile data to send: ", profile);

    if (profile.roles.User === 2001) {
      profile.dietaryRestrictions = [];
      document
        .querySelectorAll('input[name="dietary-restriction"]:checked')
        .forEach((checkbox) => {
          profile.dietaryRestrictions.push(checkbox.value);
        });

      profile.intolerances = [];
      document
        .querySelectorAll('input[name="intolerances"]:checked')
        .forEach((checkbox) => {
          profile.intolerances.push(checkbox.value);
        });

      profile.excludedIngredients = document
        .getElementById("excluded-ingredients")
        .value.split(", ")
        .map((ingredient) => ingredient.trim());
    }

    // Log the final profile data to be sent
    console.log("Final profile data to send: ", JSON.stringify(profile));

    const response = await fetch(`http://localhost:3500/users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get error text
      throw new Error(
        `Error updating user data: ${response.statusText} - ${errorText}`
      );
    }

    const updatedProfile = await response.json();

    console.log("Profile updated: ", updatedProfile);
    alert("Profile updated successfully.");
    await fetchUser();
  } catch (error) {
    console.error(error);
    alert(`Failed to update profile: ${error.message}`);
  }
}

// Edit Profile (PATCH)
async function editProfile(updates) {
  try {
    const accessToken = localStorage.getItem("AccessToken");
    const userId = JSON.parse(localStorage.getItem("UserInfo")).userid;

    console.log(`Editing profile data for user: ${userId}`);

    if (updates.dob) {
      updates.dateOfBirth = updates.dob;
      delete updates.dob;
    }

    const response = await fetch(`http://localhost:3500/users/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Error editing user data: ${response.statusText}`);
    }

    const updatedProfile = await response.json();

    console.log("Profile edited: ", updatedProfile);
    alert("Profile edited successfully.");
    await fetchUser();
  } catch (error) {
    console.error(error);
    alert("Failed to edit profile.");
  }
}

// Use to get role number
function getRoleCode(role) {
  switch (role) {
    case "User":
      return 2001;
    case "Volunteer":
      return 2002;
    case "Admin":
      return 2003;
    default:
      return null;
  }
}
