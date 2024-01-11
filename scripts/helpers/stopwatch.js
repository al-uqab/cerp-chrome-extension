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

    const getStopwatchPausedState = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['isStopwatchPaused'], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result.isStopwatchPaused || false);
                }
            });
        });
    };

    const setStopwatchPausedState = (isPaused) => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ isStopwatchPaused: isPaused }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    };

    const initStopwatch = async ( isRunning = false, isPaused = false ) => {
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

        console.log(storageData);

        if (storageData.startedAt) {
            startedAt = storageData.startedAt;
        } else {
            await chrome.storage.session.set({startedAt: startedAt});
        }

        if (storageData.pausedAt && isPaused) {
            return updateStopwatch(storageData.pausedAt);
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
                await setStopwatchPausedState(false);
            } else {
                const isPaused = await getStopwatchPausedState();

                if (isPaused) {
                    await initStopwatch(false, true);
                }
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

        if (isReset) {
            // Remove both 'startedAt' and 'pausedAt' from storage
            await chrome.storage.local.remove(['isStopwatchPaused', 'isStopwatchRunning']);
            return chrome.storage.session.remove(['startedAt', 'pausedAt']);
        } else {
            await chrome.storage.session.set({ pausedAt: elapsedPausedTime });
            await setStopwatchRunningState(false);
            await setStopwatchPausedState(true);
        }
    };

    const resetStopwatch = () => {
        pauseStopwatch(true);

        const elapsedMinutes = Math.floor(elapsedPausedTime / (1000 * 60)); // Convert milliseconds to minutes
        api.sendTaskTime(currentTaskId, elapsedMinutes);

        elapsedPausedTime = 0;
        displayTime(0, 0, 0);
    };

    const updateStopwatch = (elapsedPausedTime = 0) => {
        let elapsedTime;
        if (!elapsedPausedTime) {
            const currentTime = new Date().getTime();
            elapsedTime = currentTime - startTime;
        } else {
            elapsedTime = elapsedPausedTime;
        }
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
