"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout');

    logoutButton.addEventListener('click', async () => {
        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch('https://dev.contenterp.com/api/v2/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token })
            });

            if (response.ok) {
                const responseData = await response.json();

                if (responseData.code === 200) {
                    // Logout successful
                    localStorage.removeItem('accessToken');
                    window.location.href = 'index.html';
                } else {
                    console.error('Logout failed:', responseData.message); // Handle unsuccessful logout
                }
            } else {
                console.error('Error:', response.status); // Handle other HTTP errors
            }
        } catch (error) {
            console.error('Error:', error); // Handle fetch or other errors
        }
    });

    const getUsername = () => localStorage.getItem('username') || 'Guest User';

    const setInitialUsername = () => {
        const username = getUsername();
        const usernameElement = document.querySelector('.ce-timetracking__username');
        if (usernameElement) {
            usernameElement.textContent = username;
        }
    };

    setInitialUsername();
});
