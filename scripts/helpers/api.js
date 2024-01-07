'use strict';

import storage from './storage.js';
import ui from './interface.js';

const BASE_URL = 'https://dev.contenterp.com/api/v2';
const storageData = storage.getValues();

const getAuthHeader = () => {
    return {
        'Authorization': `Bearer ${storageData.token}`,
    };
};

const handleFetchErrors = ( response ) => {
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    return response.json();
};

const api = {
    login: async ( email, password ) => {
        ui.injectPreloader();
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({email, password}),
            });

            const responseData = await response.json();

            if (response.ok && responseData.data && responseData.data.user && responseData.data.accessToken) {
                return {success: true, credentials: responseData};
            } else {
                ui.removePreloader();
                return {success: false, message: 'Invalid email or password'};
            }
        } catch (error) {
            ui.removePreloader();
            console.error('Error during login:', error);
            return {success: false, message: 'An error occurred during login'};
        }
    },

    logout: async () => {
        ui.injectPreloader();
        try {
            const token = storageData.token;
            const response = await fetch(`${BASE_URL}/auth/logout`, {
                method: 'POST', headers: {
                    'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`,
                }, body: JSON.stringify({token}),
            });

            if (response.ok) {
                const responseData = await response.json();

                if (responseData.code === 200) {
                    storage.clear(); // Clear all stored credentials
                    return window.location.href = 'index.html'; // Redirect to login page
                } else {
                    console.error('Logout failed:', responseData.message); // Handle unsuccessful logout
                }
            } else {
                console.error('Error:', response.status); // Handle other HTTP errors
            }
        } catch (error) {
            console.error('Error:', error); // Handle fetch or other errors
        }
        ui.removePreloader();
    },

    fetchTasks: async () => {
        try {
            const endpoint = `${BASE_URL}/tasks/by-user/${storageData.userId}/top`;
            const response = await fetch(endpoint, {
                method: 'GET', headers: getAuthHeader(),
            });
            const tasks = await handleFetchErrors(response);
            return tasks;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    },

    fetchSessions: async () => {
        try {
            const endpoint = `${BASE_URL}/time-trackings/user/${storageData.userId}/sessions`;
            const response = await fetch(endpoint, {
                method: 'GET', headers: getAuthHeader(),
            });
            const sessions = await handleFetchErrors(response);
            return sessions;
        } catch (error) {
            console.error('Error fetching sessions:', error);
            return [];
        }
    },
};

export default api;
