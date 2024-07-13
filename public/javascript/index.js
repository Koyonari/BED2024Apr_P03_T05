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

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    console.log(username, password);

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

      // Save the tokens to localStorage
      localStorage.setItem("AccessToken", result.accessToken);
      localStorage.setItem("RefreshToken", result.refreshToken);

      // Decode the access token to extract user info
      const decodedAccessToken = JSON.parse(
        atob(result.accessToken.split(".")[1])
      );

      // Save user info to localStorage
      localStorage.setItem(
        "UserInfo",
        JSON.stringify(decodedAccessToken.UserInfo)
      );

      const userId = decodedAccessToken.UserInfo.userid; // Corrected to use 'userid'
      const userRole = decodedAccessToken.UserInfo.roles[0];

      // Create a pantry for user or volunteer roles
      if (userRole === 2001 || userRole === 2002) {
        const pantryResponse = await fetch(`http://localhost:3500/pantry/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${result.accessToken}`
          }
        });

        if (!pantryResponse.ok) {
          throw new Error(`Error creating pantry: ${pantryResponse.statusText}`);
        }

        const pantryResult = await pantryResponse.json();
        console.log("Pantry created:", pantryResult.pantry_id);
        localStorage.setItem("PantryID", pantryResult.pantry_id);
      }

      // Redirect based on user role
      if (userRole === 2001) {
        // Assuming 2001 is the role code for a regular user
        window.location.href = "../html/user_homepage.html";
      } else if (userRole === 2002) {
        // Assuming 2002 is the role code for a volunteer
        window.location.href = "../html/volunteer_homepage.html";
      } else {
        throw new Error("Unknown user role");
      }
    } catch (error) {
      alert(error.message);
    }
  });
