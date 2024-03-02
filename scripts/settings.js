'use strict';

import ui from './helpers/interface.js';
import api from './helpers/api.js';
import storage from './helpers/storage.js';

ui.setUser();

const checkIfFailedSync = () => {
    const storageData = storage.getValues();
    if (storageData.failedTasks && storageData.failedTasks.length > 0) {
        const syncIcon = document.getElementById('sync-icon');
        syncIcon.src = 'images/icons/sync-exclamation.svg';
    }
}
checkIfFailedSync();

const buildUI = async () => {
    await ui.setProfilePicture();
    ui.buildSettings();
};

const handleSync = async () => {
    await api.syncTasks();
}

const handleLogout = async () => {
    await api.logout();
};

const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', handleLogout);

const syncButton = document.getElementById('sync');
syncButton.addEventListener('click', handleSync);

document.addEventListener('DOMContentLoaded', async () => {
    await buildUI();
});
