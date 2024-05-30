document.getElementById('sign-up-link').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('signup-container').classList.add('active');
});

document.getElementById('close-btn').addEventListener('click', function() {
    document.getElementById('signup-container').classList.remove('active');
});
