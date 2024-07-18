// Select the list element where requests will be displayed
let list = document.querySelector(".list");
let listvol = document.querySelector(".list-vol");

// Fetch user id and token
const userId = localStorage.getItem('UserId');
const accessToken = localStorage.getItem('AccessToken');

// Global variable to store the requests array
let globalRequests = [];
