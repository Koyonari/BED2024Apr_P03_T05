// Select the list element where requests will be displayed
let list = document.querySelector(".list");
let listvol = document.querySelector(".list-vol");

// Fetch user id and token
const userId = localStorage.getItem('UserId');
const accessToken = localStorage.getItem('AccessToken');

// Global variable to store the requests array
let globalRequests = [];

// GET: getAcceptedRequestById
// Initialize the app by populating the list with requests
async function initApp() {
    try {
        const response = await fetch(`http://localhost:3500/requests/req/accepted/${userId}`, {
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

async function fetchPantryId(userId) {
    const response = await fetch(`http://localhost:3500/pantry/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Error fetching pantry ID: ${response.statusText}`);
    }

    const pantryData = await response.json();
    return pantryData.pantry_id;
}

async function fetchUser(userId) {
    const response = await fetch(`http://localhost:3500/users/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching user data: ${response.statusText}`);
    }

    const userData = await response.json();
    return userData;
}

initApp();

// GET: getRequestById
// Function to handle "View Details" button click
async function viewDetails(key) {
    try {
        let requestId = globalRequests[key].request_id;
        // Fetch and display ingredients
        await displayReqIng(requestId);
        const response = await fetch(`http://localhost:3500/requests/req/${requestId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {      
            const request = await response.json();

            console.log('Request details fetched:', request);

            // Call to get user address, email, contact from mongo
            requestee_id = request.user_id;

            localStorage.setItem('request_id', request.request_id);
            localStorage.setItem('requestee_id', requestee_id);

            fetchUser(requestee_id)
                .then(user => {
                    const { address, email, contact } = user;
                    document.getElementById('ua').innerText = `User Address: ${address}`;
                    document.getElementById('ucontact').innerText = `User Number: ${contact}`;
                    document.getElementById('uemail').innerText = `User Email: ${email}`;
                })
                .catch(error => {
                    console.error('Error:', error);
                }
            );

            // Populate modal with request details
            document.getElementById('modal').dataset.key = key;
            document.getElementById('modalNum').innerText = `Request ${document.querySelector(`.item:nth-child(${key + 1})`).dataset.num}`;
            document.getElementById('modalTitle').innerText = `Title: ${request.title}`;
            document.getElementById('modalCategory').innerText = `Category: ${request.category}`;
            document.getElementById('modalStatus').innerText = `Status:  ${getStatusText(request)}`;
            document.getElementById('modalDescription').innerText = `Description: ${request.description}`;

  

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

const inglist = document.getElementById('ingredients-list');
async function displayReqIng(requestId) {
    try {
        const response = await fetch(`http://localhost:3500/requests/req/ing/${requestId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            const ingredients = await response.json();
            console.log('Ingredients fetched:', ingredients);


            // Set the text for each corresponding HTML element
            const username = document.getElementById('u_name');
            inglist.innerHTML = '';
            const volunteerName = document.getElementById('v_name');

            if (ingredients.length > 0) {
                if (ingredients[0].volunteer_name != null) {
                    volunteerName.textContent = `Volunteer: ${ingredients[0].volunteer_name}`;
                }
                username.textContent = `User: ${ingredients[0].user_name}`;
            }

            // Display all ingredients
            ingredients.forEach(ingredient => {
                const ingredientItem = document.createElement('p');
                ingredientItem.textContent = `${ingredient.ingredient_name}: ${ingredient.ingredient_quantity}`;
                inglist.appendChild(ingredientItem);
            });
        } else {
            if (response.status === 404) {
                inglist.innerHTML = 'No ingredients';
            } else {
                const error = await response.json();
                console.error('Error fetching ingredients:', error);
                alert(`Error fetching ingredients: ${error.message}`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching ingredients');
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

function addIngredients() {
    window.location.href = 'pantry_vol.html';
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