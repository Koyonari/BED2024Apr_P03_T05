document
  .getElementById("sign-up-link")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("signup-container").classList.add("active");
  });

document.getElementById("close-btn").addEventListener("click", function () {
  document.getElementById("signup-container").classList.remove("active");
});

//////////////////////////////////////////////////////////////////////////////////// Sign In Logic

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  // Sample user data
  const users = [
    {
      username: "user1",
      roles: { User: 2001 },
      password: "123",
      address: "123 User St",
      dietaryRestrictions: ["Vegetarian", "Vegan"],
      intolerances: ["Gluten", "Peanut"],
      excludedIngredients: ["Mushrooms"],
      dateCreated: "2023-01-01T00:00:00Z",
      email: "user@gmail.com",
      contact: "1234567890",
    },
    {
      username: "volunteer1",
      roles: { Volunteer: 2002 },
      password: "123",
      address: "456 Volunteer Ave",
      dietaryRestrictions: null,
      intolerances: null,
      excludedIngredients: null,
      dateCreated: "2023-01-01T00:00:00Z",
      email: "volunteer@gmail.com",
      contact: "0987654321",
    },
  ];

  const email = document.getElementById("email-login").value;
  const password = document.getElementById("password-login").value;

  const user = users.find(
    (user) => user.email === email && user.password === password
  );

  if (user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    if (user.role === "User") {
      window.location.href = "user_homepage.html";
    } else if (user.role === "Volunteer") {
      window.location.href = "volunteer_homepage.html";
    }
  } else {
    alert("Invalid email or password.");
  }
});
