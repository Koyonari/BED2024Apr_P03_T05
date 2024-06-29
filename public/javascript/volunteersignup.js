///////////////////////////////////////////////// Create User
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

  // Basic form validation
  if (!username || !firstname || !lastname || !dob || !password || !address || !email || !contact || !role) {
    alert("Please fill out all required fields.");
    return;
  }
  // Create user object
  var volunteer = {
    username: username,
    fullname: fullname,
    lastname: lastname,
    roles: {
      "User": 2001,
    },
    password: password,
    address: address,
    dietaryRestrictions: null,
    intolerances: null,
    excludedIngredients: null,
    email: email,
    contact: contact,
    dateOfBirth: dob,
  };

  // Optionally, you can send this data to the server for processing
  // For example, using fetch to send the data to a server endpoint
  /* fetch('https://your-api-endpoint', {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    }); */

  // Reset form fields
  document.querySelector("form").reset();

  // Display success message or redirect to another page
  console.log(volunteer);
  alert("User created successfully!");
});
/////////////////////////////////////////////////
