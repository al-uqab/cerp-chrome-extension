'use strict';

import api from './api.js';

const createStopwatch = () => {
    let startTime = null;
    let stopwatchInterval = null;
    let elapsedPausedTime = 0;
    let timeTrackedDisplay = null;
    let currentTaskId = null;

    const setCurrentTaskId = ( id ) => {
        currentTaskId = id;
    };

    const getStopwatchRunningState = () => {
        return new Promise(( resolve, reject ) => {
            chrome.storage.local.get(['isStopwatchRunning'], ( result ) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result.isStopwatchRunning || false);
                }
            });
        });
    };

    const setStopwatchRunningState = ( isRunning ) => {
        return new Promise(( resolve, reject ) => {
            chrome.storage.local.set({isStopwatchRunning: isRunning}, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    };

    const initStopwatch = async ( isRunning = false ) => {
        let startedAt = new Date().getTime();

        const storageData = await new Promise(( resolve, reject ) => {
            chrome.storage.session.get(['startedAt', 'pausedAt'], ( result ) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
        });

        if (storageData.startedAt) {
            startedAt = storageData.startedAt;
        } else {
            await chrome.storage.session.set({startedAt: startedAt});
        }

        if (storageData.pausedAt && !isRunning) {
            startTime = new Date().getTime() + storageData.pausedAt;
        } else if (isRunning) {
            startTime = startedAt - elapsedPausedTime;
        } else {
            startTime = new Date().getTime() - elapsedPausedTime;
        }

        if (!stopwatchInterval) {
            stopwatchInterval = setInterval(updateStopwatch, 1000);
        }
    };

    const startStopwatch = async ( displayElement, manualStart = true ) => {
        api.startTask(currentTaskId);

        timeTrackedDisplay = displayElement;
        try {
            const isRunning = await getStopwatchRunningState();

            if (isRunning) {
                await initStopwatch(true);
            } else if (!isRunning && manualStart) {
                await initStopwatch();
                await setStopwatchRunningState(true);
            }

            return isRunning;
        } catch (error) {
            console.error('Error occurred:', error);
        }

    };

    const pauseStopwatch = async ( isReset = false ) => {
        clearInterval(stopwatchInterval);
        elapsedPausedTime = new Date().getTime() - startTime;
        stopwatchInterval = null;

        await setStopwatchRunningState(false);
        if (isReset) {
            // Remove both 'startedAt' and 'pausedAt' from storage
            return chrome.storage.session.remove(['startedAt', 'pausedAt']);
        }
    };

    // const pauseStopwatch = ( isReset = false ) => {
    //     clearInterval(stopwatchInterval);
    //     elapsedPausedTime = new Date().getTime(); // Store the current timestamp when paused
    //     stopwatchInterval = null;
    //
    //     if (isReset) {
    //         // Remove both 'startedAt' and 'pausedAt' from storage
    //         return chrome.storage.session.remove(['startedAt', 'pausedAt']);
    //     } else {
    //         // Update 'pausedAt' value in storage
    //         return chrome.storage.session.set({pausedAt: elapsedPausedTime});
    //     }
    // };


    const resetStopwatch = () => {
        pauseStopwatch(true);

        const elapsedMinutes = Math.floor(elapsedPausedTime / (1000 * 60)); // Convert milliseconds to minutes
        api.sendTaskTime(currentTaskId, elapsedMinutes);

        elapsedPausedTime = 0;
        displayTime(0, 0, 0);
    };

    const updateStopwatch = () => {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - startTime;
        const {seconds, minutes, hours} = calculateTimeComponents(elapsedTime);

        displayTime(seconds, minutes, hours);
    };

    const calculateTimeComponents = ( elapsedTime ) => {
        const seconds = Math.floor(elapsedTime / 1000) % 60;
        const minutes = Math.floor(elapsedTime / 1000 / 60) % 60;
        const hours = Math.floor(elapsedTime / 1000 / 60 / 60);

        return {seconds, minutes, hours};
    };

    const displayTime = ( seconds, minutes, hours ) => {
        if (!timeTrackedDisplay) return;
        updateTimeElements('#seconds', pad(seconds));
        updateTimeElements('#minutes', pad(minutes));
        updateTimeElements('#hours', pad(hours));
    };

    const updateTimeElements = ( selector, value ) => {
        if (!timeTrackedDisplay) return;
        const element = timeTrackedDisplay.querySelector(selector);
        if (element) {
            element.innerText = value;
        }
    };

    const pad = ( number ) => {
        return (number < 10 ? '0' : '') + number;
    };

    return {startStopwatch, pauseStopwatch, resetStopwatch, setCurrentTaskId};
};

export default createStopwatch;
