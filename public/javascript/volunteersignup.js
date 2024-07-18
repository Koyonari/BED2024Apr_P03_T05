// Yeo Jing Rong

// Handle form submission
document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form submission

  // Get user input values
  var username = document.getElementById("username").value.trim();
  var firstname = document.getElementById("firstname").value.trim();
  var lastname = document.getElementById("lastname").value.trim();
  var dob = document.getElementById("dob").value.trim();
  var password = document.getElementById("password-signup").value.trim();
  var address = document.getElementById("address").value.trim();
  var email = document.getElementById("email-signup").value.trim();
  var contact = document.getElementById("contact").value.trim();
  var role = document.getElementById("role").value.trim();

  // Check for Empty Fields
  if (
    !username ||
    !firstname ||
    !lastname ||
    !dob ||
    !password ||
    !address ||
    !email ||
    !contact ||
    !role
  ) {
    alert("Please fill out all required fields.");
    return;
  }

  // Password validation
  var passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordPattern.test(password)) {
    alert(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );
    return;
  }

  // Create volunteer object
  var user = {
    username: username,
    firstname: firstname,
    lastname: lastname,
    roles: {
      Volunteer: 2002,
    },
    password: password,
    address: address,
    email: email,
    contact: contact,
    dateOfBirth: dob,
  };

  // Send the data to the server for processing
  fetch("http://localhost:3500/register", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) =>
      response.json().then((data) => ({ status: response.status, body: data }))
    )
    .then(({ status, body }) => {
      if (status === 201) {
        console.log("Success:", body);
        alert("Register successful, you can now login via the login page.");
        // Reset form fields
        document.querySelector("form").reset();
      } else {
        console.error("Error:", body);
        alert("There was an error creating the user: " + body.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("There was an error creating the user.");
    });
});
