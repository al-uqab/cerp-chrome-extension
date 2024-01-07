'use strict';

import storage from './storage.js';

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
                return {success: false, message: 'Invalid email or password'};
            }
        } catch (error) {
            console.error('Error during login:', error);
            return {success: false, message: 'An error occurred during login'};
        }
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
