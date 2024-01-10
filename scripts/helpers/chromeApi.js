'use strict';

const chromeApi = {

    clear: () => {
        chrome.storage.local.remove(['isStopwatchRunning'], () => {
        });
        chrome.storage.session.remove(['startedAt', 'pausedAt'], () => {
        });
    },

};

export default chromeApi;
