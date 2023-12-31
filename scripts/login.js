document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const preloaderContainer = document.createElement('div');
    preloaderContainer.id = 'preloaderContainer';

    document.body.appendChild(preloaderContainer);

    try {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('https://dev.contenterp.com/api/v2/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        const responseData = await response.json();

        if (response.ok && responseData.data && responseData.data.user && responseData.data.accessToken) {
            // Success: User object with accessToken exists in the response
            const accessToken = responseData.data.accessToken;

            // Store accessToken in local storage
            localStorage.setItem('accessToken', accessToken);

            window.location.href = 'timetracking.html';
        } else {
            // Invalid email or password
            alert('Invalid email or password. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching preloader content:', error);
    } finally {
        // Hide the preloader after processing the login request
        document.getElementById('preloader').style.display = 'none';
        document.body.removeChild(preloaderContainer);
    }
});

// Check if accessToken exists in local storage
document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
        // AccessToken exists, redirect to 'timetracking.html' or perform other actions as needed
        window.location.href = 'timetracking.html';
    }
});
