// Select the list element where requests will be displayed
let list = document.querySelector(".list");

// Requests data
let requests = [
  {
    id: 1,
    request_Title: "Request 1",
    request_Category: "High Priority",
    request_Status: "Pending",
    request_Description:
      "I Need Food helppppppppppppppppppppppppppppppppppppppppp",
  },
  {
    id: 2,
    request_Title: "Request 2",
    request_Category: "High Priority",
    request_Status: "Accepted",
    request_Description: "I Need Food ",
  },
  {
    id: 3,
    request_Title: "Request 3",
    request_Category: "High Priority",
    request_Status: "Accepted",
    request_Description: "I Need Food ",
  },
  {
    id: 4,
    request_Title: "Request 4",
    request_Category: "High Priority",
    request_Status: "Accepted",
    request_Description: "I Need Food ",
  },
];

// Initialize the app by populating the list with requests
function initApp() {
  requests.forEach((value, key) => {
    let newDiv = document.createElement("div");
    newDiv.classList.add("item");
    newDiv.innerHTML = `
      <div class="request-Title">${value.request_Title}</div>
      <div class="request-Category">${value.request_Category}</div>
      <div class="request-Status">${value.request_Status}</div>
      <div class="request-Description">${value.request_Description}</div>
      <button onclick="viewDetails(${key})">View Details</button>`;
    list.appendChild(newDiv);
  });
}

// Function to handle the "View Details" button click and show modal
function viewDetails(key) {
  let request = requests[key];
  alert(`
    Title: ${request.request_Title}
    Category: ${request.request_Category}
    Status: ${request.request_Status}
    Description: ${request.request_Description}
  `);
}

// Call initApp to populate the list on page load
initApp();
