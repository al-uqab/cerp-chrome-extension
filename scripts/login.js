document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const preloaderContainer = document.createElement('div');
    preloaderContainer.id = 'preloaderContainer';

    document.body.appendChild(preloaderContainer);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                preloaderContainer.innerHTML = xhr.responseText;
                document.getElementById('preloader').style.display = 'block';

                // Simulate a POST request to /v2/login
                // Replace this with your actual AJAX request logic using fetch, XMLHttpRequest, or any preferred method
                // Simulating a delay to mimic a network request
                setTimeout(() => {
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;

                    if (email === 'mohamed@mail.com' && password === 'test') {
                        window.location.href = 'timetracking.html';
                    } else {
                        alert('Invalid email or password. Please try again.');
                    }

                    // Hide the preloader after processing the login request
                    document.getElementById('preloader').style.display = 'none';
                    document.body.removeChild(preloaderContainer);
                }, 2000); // Simulated 2-second delay for demonstration purposes (remove this line in actual implementation)
            } else {
                console.error('Error fetching preloader content:', xhr.status);
            }
        }
    };

    // Fetch the preloader content
    xhr.open('GET', 'preloader.html');
    xhr.send();
});
