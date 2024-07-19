// Select the list element where requests will be displayed
let list = document.querySelector(".list");
let listvol = document.querySelector(".list-vol");

// Fetch user id and token
const userId = localStorage.getItem('UserId');
const accessToken = localStorage.getItem('AccessToken');

// Global variable to store the requests array
let globalRequests = [];

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
            globalRequests = requests;
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
            <div class="request-Title">Title: ${title}</div>
            <div class="request-Category">Category: ${category}</div>
            <div class="request-Status">Status: ${status}</div>
            <div class="request-Description">Description: ${description}</div>
            <button onclick="viewDetails(${key})">View Details</button>`;
        container.appendChild(newDiv);
        newDiv.dataset.num = num;
        num++;
    });
    applyStyles();
}

// Initialize the app
initApp();

// GET: getRequestById
// Function to handle "View Details" button click
async function viewDetails(key) {
    try {
        // Get the request_id from the selected request
        let requestId = globalRequests[key].request_id;
        const response = await fetch(`http://localhost:3500/req/${requestId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            const request = await response.json();
            console.log('Request details fetched:', request);

            // Populate modal with request details
            document.getElementById('modal').dataset.key = key;
            document.getElementById('modalNum').innerText = `Request ${document.querySelector(`.item:nth-child(${key + 1})`).dataset.num}`;
            document.getElementById('modalTitle').innerText = `Title: ${request.title}`;
            document.getElementById('modalCategory').innerText = `Category: ${request.category}`;
            document.getElementById('modalStatus').innerText = `Status:  ${getStatusText(request)}`;
            document.getElementById('modalDescription').innerText = `Description: ${request.description}`;

            // Give margin bottom to modal num
            let modalNumElement = document.getElementById('modalNum');
            modalNumElement.style.marginBottom = '10px'; 
            modalNumElement.style.marginBottom = '25px'; 

            // Show the modal
            toggleModal();
        } else {
            const error = await response.json();
            console.error('Error fetching request details:', error);
            alert(`Error fetching request details: ${error.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching request details');
    }
}

// Helper function to determine status text
function getStatusText(request) {
    if (request.isCompleted) {
        return 'Completed';
    } else if (request.volunteer_id) {
        return 'Accepted';
    } else {
        return 'Pending';
    }
}

function toggleModal() {
    let modal = document.getElementById('modal');
    modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
}

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
    modalContent.style.justifyContent = "center";
    modalContent.style.alignItems = "center";
    modalContent.style.position = "fixed";
    modalContent.style.top = "25vh";
    modalContent.style.left = "50%";
    modalContent.style.transform = "translate(-50%, -50%)";
    modalContent.style.overflow = "auto";
}

function togglepopup(popupid) {
    document.getElementById(popupid).classList.toggle("active");
}

function closepopup(popupid) {
    document.getElementById(popupid).classList.toggle("none");
    document.getElementById('ctitle').value = '';
    document.getElementById('cmessage').value = '';
    window.location.reload();
}

// POST: createRequest
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

async function markAsCompleted() {
    let key = document.getElementById('modal').dataset.key;
    let requestId = globalRequests[key].request_id;
    try {
        const response = await fetch(`http://localhost:3500/req/completed/${requestId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            const updatedRequest = await response.json();
            console.log('Request marked as completed:', updatedRequest);

            const index = globalRequests.findIndex(req => req.request_id === requestId);
            globalRequests[index] = updatedRequest;

            displayRequests(globalRequests, document.getElementById('request-list'));
            window.location.reload();
        } else {
            const error = await response.json();
            console.error('Error marking request as completed:', error);
            alert(`Error marking request as completed: ${error.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while marking the request as completed');
    }
}

// DELETE: deleteRequest
async function deleteRequest() {
    try {
        let key = document.getElementById('modal').dataset.key;
        let requestId = globalRequests[key].request_id;

        const response = await fetch(`http://localhost:3500/req/${requestId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
            
        });

        if (response.ok) {
            alert('Request deleted successfully');
            window.location.reload();
        } else {
            const error = await response.json();
            console.error('Error deleting request:', error);
            alert(`Error deleting request: ${error.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while deleting request');
    }
}