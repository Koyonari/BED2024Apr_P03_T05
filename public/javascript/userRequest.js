// Select the list element where requests will be displayed
let list = document.querySelector(".list");

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

function toggleModal() {
    let modal = document.getElementById('modal');
    modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
}

// Initialize the app
initApp();

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
