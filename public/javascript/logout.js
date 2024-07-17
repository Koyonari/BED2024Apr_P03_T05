// Get Logout Element
const logoutBtn = document.getElementById("logOutBtn");

// Log Out Function
logoutBtn.addEventListener("click", async () => {
  try {
    const response = await fetch("http://localhost:3500/logout", {
      method: "GET", 
      credentials: 'include' // Ensure cookies are sent with the request
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

