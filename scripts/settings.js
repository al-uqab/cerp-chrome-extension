'use strict';

import ui from './helpers/interface.js';
import api from './helpers/api.js';

ui.setUser();

const buildUI = async () => {
    await ui.setProfilePicture();
    ui.buildSettings();
};

const handleLogout = async () => {
    await api.logout();
};

const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', handleLogout);
document.addEventListener('DOMContentLoaded', async () => {
    await buildUI();
});
