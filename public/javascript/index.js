// Yeo Jin Rong - Handle Login
// Ng Kai Huat Jason - Creates Pantry for User and Volunteer

// On Page Loaders
document.addEventListener("DOMContentLoaded", async function () {
  await checkAndRefreshToken();
});

// Getting Elements by ID
document
  .getElementById("sign-up-link")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("signup-container").classList.add("active");
  });

document.getElementById("close-btn").addEventListener("click", function () {
  document.getElementById("signup-container").classList.remove("active");
});

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    await handleLogin();
  });

// Function to handle Logion POST /auth
async function handleLogin() {
  // Gets the username and password from the input fields
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Alert user if username or password is empty
  if (!username || !password) {
    alert("Please enter both username and password");
    return;
  }

  // Sends request to backend to authenticate user
  try {
    const response = await fetch("http://localhost:3500/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`Error logging in: ${response.statusText}`);
    }

    const result = await response.json();

    // Store access token in localStorage
    localStorage.setItem("AccessToken", result.accessToken);

    // Decode the access token to get user info
    const decodedAccessToken = JSON.parse(
      atob(result.accessToken.split(".")[1])
    );
    localStorage.setItem(
      "UserInfo",
      JSON.stringify(decodedAccessToken.UserInfo)
    );

    // If User role is 2001 or 2002, calls POST /pantry to create pantry
    // 2001 is for "User" & 2002 is for "Volunteer"
    const userId = decodedAccessToken.UserInfo.userid;
    const userRole = decodedAccessToken.UserInfo.roles[0];
    localStorage.setItem("UserId", userId);

    console.log("Login successful.");

    // Call function to create pantry if needed
    await createPantryIfNeeded(userRole, userId, result.accessToken);

    // Redirect to homepage
    redirectToHomepage(userRole);
  } catch (error) {
    alert(error.message);
  }
}

// Function to create pantry if user role is User or Volunteer
async function createPantryIfNeeded(userRole, userId, accessToken) {
  if (userRole === 2001 || userRole === 2002) {
    try {
      const pantryResponse = await fetch(
        `http://localhost:3500/pantry/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!pantryResponse.ok) {
        throw new Error(`Error creating pantry: ${pantryResponse.statusText}`);
      }

      // Stores Pantry ID in local storage
      const pantryResult = await pantryResponse.json();
      localStorage.setItem("PantryID", pantryResult.pantry_id);
      console.log("Pantry created successfully.");
    } catch (error) {
      console.error("Error creating pantry:", error);
    }
  }
}

// Function to check and refresh token via Cookie stored in browser
// Will be ran on page load to redirect logged in Users to their respective pages
async function checkAndRefreshToken() {
  const refreshToken = getCookie("jwt");

  // Logs if user isnt logged in 
  if (!refreshToken) {
    console.log("No refresh token found. User needs to log in.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3500/refresh", {
      method: "GET",
      credentials: "include", // Allows cookies to be sent in the request
    });

    if (!response.ok) {
      throw new Error(`Error refreshing token: ${response.statusText}`);
    }

    // Sets a the newly signed Token in local storage
    const result = await response.json();
    localStorage.setItem("AccessToken", result.accessToken);

    const decodedAccessToken = JSON.parse(
      atob(result.accessToken.split(".")[1])
    );
    localStorage.setItem(
      "UserInfo",
      JSON.stringify(decodedAccessToken.UserInfo)
    );

    console.log("Token refreshed successfully. Access token updated.");

    // Redirect user based on role
    redirectToHomepage(decodedAccessToken.UserInfo.roles[0]);
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
}

// Function to get the JWT cookie from the browser
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Function to Redirect Users to their respective pages based on Role
function redirectToHomepage(userRole) {
  if (userRole === 2001) {
    window.location.href = "../html/user_homepage.html";
  } else if (userRole === 2002) {
    window.location.href = "../html/volunteer_homepage.html";
  } else if (userRole === 2003) {
    window.location.href = "../html/admin_homepage.html";
  } else {
    alert("Unknown user role. Redirecting to login page.");
    window.location.href = "../index.html";
  }
}
