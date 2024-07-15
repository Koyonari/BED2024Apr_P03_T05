document.addEventListener("DOMContentLoaded", async function () {
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

function redirectToHomepage(userRole) {
  if (userRole === 2001) {
    window.location.href = "../html/user_homepage.html";
  } else if (userRole === 2002) {
    window.location.href = "../html/volunteer_homepage.html";
  } else {
    alert("Unknown user role. Redirecting to login page.");
  }
}
