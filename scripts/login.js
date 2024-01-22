'use strict';

import storage from './helpers/storage.js';
import api from './helpers/api.js';


const isLoggedIn = storage.getValues().token || false;

if (isLoggedIn) {
    window.location.href = 'timetracking.html';
}

const loginForm = document.getElementById('loginForm');

const attemptLogin = async () => {
    const userEmail = document.getElementById('email').value;
    const userPassword = document.getElementById('password').value;
    return await api.login(userEmail, userPassword);
};

function capitalizeFirstLetter( string ) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

const handleSuccessfulLogin = ( response ) => {
    if (!response.success) {
        alert('Invalid email or password. Please try again.');
    }

    const userData = response.credentials.data.user;
    const accessToken = response.credentials.data.accessToken;

    const {id, firstName, lastName} = userData;
    const formattedUserName = `${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(lastName.charAt(0))}.`;

    storage.setValues({token: accessToken, userId: id, userName: formattedUserName});
    return window.location.href = 'timetracking.html';
};

const handleLoginFormSubmission = ( event ) => {
    event.preventDefault();
    attemptLogin().then(handleSuccessfulLogin);
};

loginForm.addEventListener('submit', handleLoginFormSubmission);
