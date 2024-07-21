// Yeo Jin Rong

// Flag to prevent infinite redirection loop
let isTokenRefreshing = false;

// On Page Loaders
document.addEventListener("DOMContentLoaded", async function () {
  await checkAndRefreshToken();
});

// Gets Exit Button ID
const logoutBtn = document.getElementById("logOutBtn");

// Log Out Function
logoutBtn.addEventListener("click", async () => {
  try {
    const response = await fetch("http://localhost:3500/logout", {
      method: "GET",
      credentials: 'include' // Allows cookies to be sent in request
    });

    if (!response.ok) {
      throw new Error(`Error logging out: ${response.statusText}`);
    }

    // Clear tokens and user info from localStorage
    localStorage.removeItem("AccessToken");
    localStorage.removeItem("UserInfo");
    localStorage.removeItem("PantryID");

    // Redirect to login page
    window.location.href = "/";
  } catch (error) {
    console.error("Error logging out:", error);
  }
});

// Function to check and refresh token via Cookie stored in browser
// Will be ran on page load to redirect logged in Users to their respective pages
async function checkAndRefreshToken() {
  if (isTokenRefreshing) return;
  isTokenRefreshing = true;

  const refreshToken = getCookie("jwt");

  // Logs if user isn't logged in 
  if (!refreshToken) {
    console.log("No refresh token found. User needs to log in.");
    isTokenRefreshing = false;
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

    // Sets a newly signed Token in local storage
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

    // Redirect user based on role if on login page
    if (window.location.pathname === "/index.html") {
      redirectToHomepage(decodedAccessToken.UserInfo.roles[0]);
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  } finally {
    isTokenRefreshing = false;
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
