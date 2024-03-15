'use strict';

const storage = {
    getValues: () => {
        if (typeof localStorage === 'undefined') {
            return {};
        }

        return {
            token: localStorage.getItem('accessToken') || '',
            userId: localStorage.getItem('userId') || '',
            userFullName: localStorage.getItem('userFullName') || '',
            userName: localStorage.getItem('userName') || '',
            userRole: localStorage.getItem('userRole') || '',
            memberSince: localStorage.getItem('memberSince') || '',
            userProfilePicture: sessionStorage.getItem('userProfilePicture') || '',
            lastSynced: localStorage.getItem('lastSynced') || '',
            failedTasks: getValidJSON('failedTasks') || []
        };
    },

    setValues: ({ token = '', userId = '', userFullName = '', userName = '', userRole = '', memberSince = '', userProfilePicture = '', lastSynced = '', failedTasks = [] }) => {
        if (typeof localStorage === 'undefined') {
            console.log('localStorage is not available in this context.');
            return;
        }

        if (token) {
            localStorage.setItem('accessToken', token);
        }
        if (userId) {
            localStorage.setItem('userId', userId);
        }
        if (userFullName) {
            localStorage.setItem('userFullName', userFullName);
        }
        if (userName) {
            localStorage.setItem('userName', userName);
        }
        if (userRole) {
            localStorage.setItem('userRole', userRole);
        }
        if (memberSince) {
            localStorage.setItem('memberSince', memberSince);
        }
        if (userProfilePicture) {
            sessionStorage.setItem('userProfilePicture', userProfilePicture)
        }
        if (lastSynced) {
            localStorage.setItem('lastSynced', lastSynced);
        }
        if (failedTasks.length > 0) {
            setJSON('failedTasks', failedTasks);
        }
    },

    clear: () => {
        if (typeof localStorage === 'undefined') {
            console.log('localStorage is not available in this context.');
            return;
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userFullName');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('memberSince');
        sessionStorage.removeItem('userProfilePicture');
        localStorage.removeItem('lastSynced');
        localStorage.removeItem('failedTasks');
    },
};

const getValidJSON = (key) => {
    try {
        const jsonString = localStorage.getItem(key);
        return jsonString ? JSON.parse(jsonString) : null;
    } catch (error) {
        console.log(`Error parsing JSON for key ${key}:`, error);
        return null;
    }
};

const setJSON = (key, value) => {
    try {
        const jsonString = JSON.stringify(value);
        localStorage.setItem(key, jsonString);
    } catch (error) {
        console.log(`Error storing JSON for key ${key}:`, error);
    }
};

export default storage;
