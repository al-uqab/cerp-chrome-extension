'use strict';

import storage from './storage.js';
import ui from './interface.js';
import chromeApi from './chromeApi.js';

const BASE_URL = 'https://dev.contenterp.com/api/v2';
const storageData = storage.getValues();

const getAuthHeader = () => {
    const headers = {
        'Content-Type': 'application/json', 'Authorization': `Bearer ${storageData.token}`,
    };

    return headers;
};

const handleFetchErrors = (response) => {
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    return response.json();
};

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const api = {
    login: async (email, password, organizationId) => {
        ui.injectPreloader();
        const body = {};
        body.email = email;
        body.password = password;
        if(organizationId) {
            body.organizationId = organizationId;
        }
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify(body),
            });

            const responseData = await response.json();

            if (response.ok && responseData.data && responseData.data.user && responseData.data.accessToken) {
                return { success: true, credentials: responseData };
            } else {
                ui.removePreloader();
                return { success: false, message: 'Invalid email or password', response: responseData };
            }
        } catch (error) {
            ui.removePreloader();
            console.error('Error during login:', error);
            return { success: false, message: 'An error occurred during login' };
        }
    },

    loginWithOrg: async (email, password, org) => {

    },

    logout: async () => {
        ui.injectPreloader();
        storage.clear(); // Clear all stored credentials
        chromeApi.clear();
        try {
            const token = storageData.token;
            const response = await fetch(`${BASE_URL}/auth/logout`, {
                method: 'POST', headers: getAuthHeader(), body: JSON.stringify({ token }),
            });

            if (response.ok) {
                const responseData = await response.json();

                if (responseData.code === 200) {
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
        return window.location.href = 'index.html'; // Redirect to login page
    },

    fetchTasks: async () => {
        try {
            const endpoint = `${BASE_URL}/contents/by-user/${storageData.userId}/top`;
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

    getUserStats: async () => {
        try {
            // Calculate the "from" and "to" dates for the last 7 days
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 6); // Subtract 6 days for a total of 7 days

            // Format the dates as YYYY-MM-DD
            const formattedTo = formatDate(toDate);
            const formattedFrom = formatDate(fromDate);

            const endpoint = `${BASE_URL}/time-trackings/user/${storageData.userId}/minutes-by-daterange?from=${formattedFrom}&to=${formattedTo}`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: getAuthHeader(),
            });

            const stats = await handleFetchErrors(response);
            return stats;
        } catch (error) {
            console.error('Error fetching sessions:', error);
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

    startTask: async (taskId) => {
        try {
            const response = await fetch(`${BASE_URL}/tasks/${taskId}/start`, {
                method: 'POST', headers: getAuthHeader(), body: JSON.stringify({ taskId }),
            });


            if (response.ok) {
                const responseData = await response.json();
            } else {
                console.error('Error starting task:', response.status); // Handle error cases
            }
        } catch (error) {
            console.error('Error:', error); // Handle fetch or other errors
        }
    },

    sendTaskTime: async (taskId, elapsedMinutes) => {
        try {
            const response = await fetch(`${BASE_URL}/tasks/${taskId}/time-trackings`, {
                method: 'POST', headers: getAuthHeader(), body: JSON.stringify({ loggedMinutes: elapsedMinutes }),
            });

            if (response.ok) {
                const responseData = await response.json();
            } else {
                console.error('Error sending task time:', response.status); // Handle error cases
            }
        } catch (error) {
            console.error('Error:', error); // Handle fetch or other errors
        }
    },
};

export default api;
