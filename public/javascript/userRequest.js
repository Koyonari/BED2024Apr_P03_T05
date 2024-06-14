// Select the list element where requests will be displayed
let list = document.querySelector(".list");
let listvol = document.querySelector(".list-vol");

// Requests data
let requests = [
    {
        id: 1,
        request_Title: "Request 1",
        request_Category: "High Priority",
        request_Status: "Pending",
        request_Description: "I Need Food helppppppppppppppppppppppppppppppppppppppppp",
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
    applyStyles();
}

function initAppVol() {
    requests.forEach((value, key) => {
        let newDiv = document.createElement("div");
        newDiv.classList.add("item");
        newDiv.innerHTML = `
            <div class="request-Title">${value.request_Title}</div>
            <div class="request-Category">${value.request_Category}</div>
            <div class="request-Status">${value.request_Status}</div>
            <div class="request-Description">${value.request_Description}</div>
            <button onclick="confirm()">Confirm</button>`;
        listvol.appendChild(newDiv);
    });
    applyStyles();
}

// Function to handle the "View Details" button click and show modal
function viewDetails(key) {
    let request = requests[key];
    document.getElementById('modalTitle').innerText = request.request_Title;
    document.getElementById('modalCategory').innerText = request.request_Category;
    document.getElementById('modalStatus').innerText = request.request_Status;
    document.getElementById('modalDescription').innerText = request.request_Description;
    document.getElementById('modalTitle1').innerText = request.request_Title;
    document.getElementById('modalCategory1').innerText = request.request_Category;
    document.getElementById('modalStatus1').innerText = request.request_Status;
    document.getElementById('modalDescription1').innerText = request.request_Description;
    toggleModal();
}

// Confirm dialog function
function confirm() {
    let confirmOverlay = document.createElement("div");
    confirmOverlay.className = "confirm-overlay";

    let confirmDialog = document.createElement("div");
    confirmDialog.className = "confirm-dialog";
    confirmDialog.innerHTML = `
        <button class="confirm-btn">Confirm</button>
        <button class="cancel-btn">Cancel</button>
    `;

    confirmOverlay.appendChild(confirmDialog);
    document.body.appendChild(confirmOverlay);

    confirmDialog.querySelector(".confirm-btn").addEventListener("click", () => {
        alert("Confirmed!");
        document.body.removeChild(confirmOverlay);
    });

    confirmDialog.querySelector(".cancel-btn").addEventListener("click", () => {
        document.body.removeChild(confirmOverlay);
    });
}

function toggleModal() {
    let modal = document.getElementById('modal');
    modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
}

// Initialize the app
initApp();
initAppVol();

// Close the modal when clicking outside of it
window.onclick = function(event) {
    let modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Function to apply CSS styles to elements
function applyStyles() {
    //Style for modal content
    let modalContent = modal.querySelector('.modal-content');
    modalContent.style.backgroundColor = "lightgrey";
    modalContent.style.margin = "15% auto";
    modalContent.style.padding = "20px";
    modalContent.style.border = "2px solid #000000";
    modalContent.style.width = "80%";
    modalContent.style.height = "70%";
    modalContent.style.display = "flex";
    modalContent.style.flexDirection = "row";
    modalContent.style.justifyContent = "center"; // Center children horizontally within the modal-content
    modalContent.style.alignItems = "center"; // Center children vertically within the modal-content
    modalContent.style.position = "fixed";
    modalContent.style.top = "25vh";
    modalContent.style.left = "50%";
    modalContent.style.transform = "translate(-50%, -50%)";
}

function togglepopup(popupid) {
    document.getElementById(popupid).classList.toggle("active");
}

async function confirmInput() {
    var title = document.getElementById("ctitle").value;
    var message = document.getElementById("cmessage").value;
    var category = document.getElementById("cat").value;

    // Create a data object to send to the server
    const requestData = {
        title: title,
        category: category,
        description: message, // Assuming 'message' corresponds to 'description' in the database
        user_id: 1, // Replace with actual user_id if available
        volunteer_id: null // Assuming no volunteer_id initially
    };

    // try {
    //     const response = await fetch('/api/requests', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(requestData)
    //     });

    //     if (!response.ok) {
    //         throw new Error('Error creating request');
    //     }

    //     const createdRequest = await response.json();
    //     console.log('Created request:', createdRequest);
    //     // Optionally, handle success feedback or redirect after creating request
    // } catch (error) {
    //     console.error('Error creating request:', error.message);
    //     // Handle error feedback
    // }
}
