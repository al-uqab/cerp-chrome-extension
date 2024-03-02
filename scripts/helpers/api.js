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
        if (organizationId) {
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

    getUserSettings: async () => {
        const userId = storageData.userId;
        if (!userId) return;

        try {
            const response = await fetch(`${BASE_URL}/users/${userId}`, {
                method: 'GET', headers: {
                    'Content-Type': 'application/json',
                }
            });

            const responseData = await response.json();

            if (response.ok && responseData.data) {
                return { success: true, data: responseData.data };
            } else {
                return { success: false, message: 'Invalid user id', response: responseData };
            }
        } catch (error) {
            console.error('Error during getting user settings:', error);
            return { success: false, message: 'An error occurred during getting user settings' };
        }
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
            const today = new Date();

            // Calculate the end date (current Sunday)
            const endDate = new Date(today);
            endDate.setDate(today.getDate() - today.getDay()); // Set to the most recent Sunday

            // Calculate the start date (previous Sunday)
            const startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 6); // Subtract 6 days for a total of 7 days

            // Format the dates as YYYY-MM-DD
            const formattedTo = formatDate(endDate);
            const formattedFrom = formatDate(startDate);

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

    getUserWeekStats: async () => {
        try {
            const today = new Date();

            // Calculate the end date (current day)
            const endDate = new Date(today);

            // Calculate the start date (most recent Sunday)
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - (today.getDay() + 6) % 7); // Set to the most recent Sunday

            // Format the dates as YYYY-MM-DD
            const formattedTo = formatDate(endDate);
            const formattedFrom = formatDate(startDate);

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

    getUserWeekSessions: async () => {
        try {
            const today = new Date();

            // Calculate the end date (current day)
            const endDate = new Date(today);

            // Calculate the start date (most recent Sunday)
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - (today.getDay() + 6) % 7); // Set to the most recent Sunday

            // Format the dates as YYYY-MM-DD
            const formattedTo = formatDate(endDate);
            const formattedFrom = formatDate(startDate);

            const endpoint = `${BASE_URL}/time-trackings/user/${storageData.userId}/sessions?from=${formattedFrom}&to=${formattedTo}`;

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
        if (!taskId) return;
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

                const currentDateTime = new Date().toISOString();
                storage.setValues({ lastSynced: currentDateTime });

                return true;
            } else {
                console.error('Error sending task time:', response.status); // Handle error cases

                const storedFailedTasks = storage.getValues().failedTasks || [];
                storedFailedTasks.push({ taskId, loggedMinutes: elapsedMinutes });
                storage.setValues({ failedTasks: storedFailedTasks });
            }
        } catch (error) {
            console.error('Error:', error); // Handle fetch or other errors

            const storedFailedTasks = storage.getValues().failedTasks || [];
            storedFailedTasks.push({ taskId, loggedMinutes: elapsedMinutes });
            storage.setValues({ failedTasks: storedFailedTasks });
        }
    },

    syncTasks: async () => {
        const storedFailedTasks = storage.getValues().failedTasks || [];

        if (storedFailedTasks.length > 0) {
            for (const { taskId, loggedMinutes } of storedFailedTasks) {
                const success = await api.sendTaskTime(taskId, loggedMinutes);

                if (success) {
                    // Remove the successfully synced task from the array
                    const updatedFailedTasks = storedFailedTasks.filter(task => task.taskId !== taskId);
                    storage.setValues({ failedTasks: updatedFailedTasks });
                }
            }
        }
    }
};

export default api;
