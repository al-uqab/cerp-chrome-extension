'use strict';

const storage = {
    getValues: () => {
        return {
            token: localStorage.getItem('accessToken') || '',
            userId: localStorage.getItem('userId') || '',
            userName: localStorage.getItem('userName') || '',
        };
    },

    setValues: ( {token = '', userId = '', userName = ''} ) => {
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
    },
};

export default storage;
