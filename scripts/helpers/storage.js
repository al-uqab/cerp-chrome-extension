'use strict';

const storage = {
    getValues: () => {
        if (typeof localStorage === 'undefined') {
            return {};
        }

        return {
            token: localStorage.getItem('accessToken') || '',
            userId: localStorage.getItem('userId') || '',
            userName: localStorage.getItem('userName') || '',
        };
    },

    setValues: ({ token = '', userId = '', userName = '' }) => {
        if (typeof localStorage === 'undefined') {
            console.error('localStorage is not available in this context.');
            return;
        }

        if (token) {
            localStorage.setItem('accessToken', token);
        }
        if (userId) {
            localStorage.setItem('userId', userId);
        }
        if (userName) {
            localStorage.setItem('userName', userName);
        }
    },

    clear: () => {
        if (typeof localStorage === 'undefined') {
            console.error('localStorage is not available in this context.');
            return;
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
    },
};

export default storage;
