// Select the list element where requests will be displayed
let list = document.querySelector(".list");
let listvol = document.querySelector(".list-vol");

// Fetch user id and token
const userId = localStorage.getItem('UserId');
const accessToken = localStorage.getItem('AccessToken');

// GET: getRequestByUserId
// Initialize the app by populating the list with requests
async function initApp() {
    try {
        const response = await fetch(`http://localhost:3500/req/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            const requests = await response.json();
            console.log('Requests fetched:', requests);

            // Display the fetched requests
            displayRequests(requests, document.getElementById('request-list'));
        } else {
            const error = await response.json();
            console.error('Error fetching requests:', error);
            alert(`Error fetching requests: ${error.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching the requests');
    }
}

function displayRequests(requests, container) {
    // Show recent request first
    requests.reverse();

    let num = 1;
    container.innerHTML = '';
    requests.forEach((request, key) => {
        const { title, description, category, volunteer_id, isCompleted } = request;
        let status = '';

        if (isCompleted) {
            status = 'Completed';
        } else if (volunteer_id) {
            status = 'Accepted';
        } else {
            status = 'Pending';
        }

        let newDiv = document.createElement("div");
        newDiv.classList.add("item");
        newDiv.innerHTML = `
            <div class="request-Num">Request ${num}</div>
            <div class="request-Title">${title}</div>
            <div class="request-Category">${category}</div>
            <div class="request-Status">${status}</div>
            <div class="request-Description">${description}</div>
            <button onclick="viewDetails(${key})">View Details</button>`;
        container.appendChild(newDiv);
        num++;
    });
    applyStyles();
}

//GET: getRequestById
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

function closepopup(popupid) {
    document.getElementById(popupid).classList.toggle("none");
    document.getElementById('ctitle').value = '';
    document.getElementById('cmessage').value = '';
}

async function confirmInput() {
        // Capture input data
        const title = document.getElementById('ctitle').value;
        const category = document.getElementById('cat').value;
        const description = document.getElementById('cmessage').value;

        // Validate the data
        if (title.length < 3 || title.length > 70) {
            alert('Title must be between 3 and 70 characters');
            return;
        }
        if (category.length > 50) {
            alert('Category must be 50 characters or less');
            return;
        }
        if (description.length > 150) {
            alert('Description must be 150 characters or less');
            return;
        }

        // Prepare the request body
        const requestBody = {
            title,
            category,
            description,
            user_id: userId
        };

        // Send data to the server
        try {
            const response = await fetch('http://localhost:3500/req', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const result = await response.json();
                alert('Request created successfully');

                // Close popup
                closepopup('new-req');
            } else {
                const error = await response.json();
                alert(`Error creating request: ${error.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the request');
        }
}
