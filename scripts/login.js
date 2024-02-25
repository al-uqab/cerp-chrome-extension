'use strict';

import storage from './helpers/storage.js';
import api from './helpers/api.js';


const isLoggedIn = storage.getValues().token || false;
let userEmail;
let userPassword;

if (isLoggedIn) {
    window.location.href = 'timetracking.html';
}

const loginForm = document.getElementById('loginForm');

const attemptLogin = async () => {
    userEmail = document.getElementById('email').value;
    userPassword = document.getElementById('password').value;
    return await api.login(userEmail, userPassword);
};

const attemptLoginWithOrg = async (organizationId) => {
    return await api.login(userEmail, userPassword, organizationId);
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

const handleSuccessfulLogin = (response) => {
    if (!response.success && response.response.code === 409) {
        const orgs = response.response.data;
        const contentElement = document.getElementById('main');
        const orgsElement = document.querySelector('.ce-login__choose-org');

        contentElement.style.display = 'none';
        orgsElement.style.display = 'flex';

        orgs.map(org => {
            const orgName = org.name ? org.name : '';
            const orgId = org.id ? org.id : '';

            const buttonElement = document.createElement('button');
            buttonElement.className = 'ce-login__org';
            buttonElement.id = orgId;
            buttonElement.textContent = orgName;

            buttonElement.onclick = () => handleOrgSelection(buttonElement.id);

            orgsElement.appendChild(buttonElement);
        })

        return;
    }

    if (!response.success) {
        alert('Invalid email or password. Please try again.');
    }

    const userData = response.credentials.data.user;
    const accessToken = response.credentials.data.accessToken;

    const { id, firstName, lastName } = userData;
    const formattedUserName = `${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(lastName.charAt(0))}.`;

    storage.setValues({ token: accessToken, userId: id, userName: formattedUserName });
    return window.location.href = 'timetracking.html';
};

const handleLoginFormSubmission = (event) => {
    event.preventDefault();
    attemptLogin().then(handleSuccessfulLogin);
};

const handleOrgSelection = (id) => {
    attemptLoginWithOrg(id).then(handleSuccessfulLogin);
}

loginForm.addEventListener('submit', handleLoginFormSubmission);
