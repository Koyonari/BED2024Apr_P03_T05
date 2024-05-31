
///////////////////////////////////////////////// Create User
document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission
  
    // Get user input values
    var Username = document.getElementById("username").value.trim();
    var Fullname = document.getElementById("Fullname").value.trim();
    var dob = document.getElementById("dob").value.trim();
    var address = document.getElementById("address").value.trim();
    var email = document.getElementById("email-signup").value.trim();
    var contact = document.getElementById("contact").value.trim();
    var password = document.getElementById("password-signup").value.trim();
    var role = document.getElementById("role").value.trim();
  
    // Basic form validation
    if (!Username || !Fullname || !dob || !address || !email || !contact || !password || !role) {
      alert("Please fill out all required fields.");
      return;
    }
  
    // Create user object
    var user = {
      Username: Username,
      Fullname: Fullname,
      dob: dob,
      address: address,
      email: email,
      contact: contact,
      password: password,
      role: role,
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
    console.log(user);
    alert("User created successfully!");
  });
  /////////////////////////////////////////////////
  