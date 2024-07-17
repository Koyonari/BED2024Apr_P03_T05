document.addEventListener("DOMContentLoaded", async function () {
  await checkAndRefreshToken();
});

document.getElementById("sign-up-link").addEventListener("click", function (event) {
  event.preventDefault();
  document.getElementById("signup-container").classList.add("active");
});

document.getElementById("close-btn").addEventListener("click", function () {
  document.getElementById("signup-container").classList.remove("active");
});

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  await handleLogin();
});

async function handleLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
      alert("Please enter both username and password");
      return;
  }

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
      const decodedAccessToken = JSON.parse(atob(result.accessToken.split(".")[1]));
      localStorage.setItem("UserInfo", JSON.stringify(decodedAccessToken.UserInfo));

      // If user has role 2001 or 2002, create pantry
      const userId = decodedAccessToken.UserInfo.userid;
      const userRole = decodedAccessToken.UserInfo.roles[0];
      localStorage.setItem("UserId", userId);

      if (userRole === 2001 || userRole === 2002) {
          const pantryResponse = await fetch(`http://localhost:3500/pantry/${userId}`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${result.accessToken}`,
              },
          });

          if (!pantryResponse.ok) {
              throw new Error(`Error creating pantry: ${pantryResponse.statusText}`);
          }

          const pantryResult = await pantryResponse.json();
          localStorage.setItem("PantryID", pantryResult.pantry_id);
      }

      console.log("Login successful. Redirecting to homepage...");
      redirectToHomepage(userRole);
  } catch (error) {
      alert(error.message);
  }
}

async function checkAndRefreshToken() {
  const refreshToken = getCookie("jwt");

  if (!refreshToken) {
      console.log("No refresh token found. User needs to log in.");
      return;
  }

  try {
      const response = await fetch("http://localhost:3500/refresh", {
          method: "GET",
          credentials: "include", // Ensure cookies are sent with the request
      });

      if (!response.ok) {
          throw new Error(`Error refreshing token: ${response.statusText}`);
      }

      const result = await response.json();
      localStorage.setItem("AccessToken", result.accessToken);

      const decodedAccessToken = JSON.parse(atob(result.accessToken.split(".")[1]));
      localStorage.setItem("UserInfo", JSON.stringify(decodedAccessToken.UserInfo));

      console.log("Token refreshed successfully. Access token updated.");

      // Redirect user based on role
      redirectToHomepage(decodedAccessToken.UserInfo.roles[0]);
  } catch (error) {
      console.error("Error refreshing token:", error);
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function redirectToHomepage(userRole) {
if (userRole === 2001) {
    window.location.href = "../html/user_homepage.html";
} else if (userRole === 2002) {
    window.location.href = "../html/volunteer_homepage.html";
} else if (userRole === 2003) {
    window.location.href = "../html/admin_homepage1.html";
} else {
    alert("Unknown user role. Redirecting to login page.");
    window.location.href = "../index.html";
}
}
