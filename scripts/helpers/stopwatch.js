'use strict';

import api from './api.js';

const createStopwatch = () => {
    let startTime = null;
    let stopwatchInterval = null;
    let elapsedPausedTime = 0;
    let timeTrackedDisplay = null;
    let currentTaskId = null;
    let resumedBeforePopupDismiss = false;

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

    const initStopwatch = async ( isRunning = false, isPaused = false, manualStart = false ) => {
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

        if (manualStart && storageData.startedAt) {
            startedAt = storageData.startedAt;
            await chrome.storage.session.set({ startedAt: startedAt });
        } else if (storageData.startedAt) {
            startedAt = storageData.startedAt;
        } else {
            await chrome.storage.session.set({startedAt: startedAt});
        }


        if (storageData.pausedAt && isPaused && !manualStart) {
            return updateStopwatch(storageData.pausedAt);
        } else if (isRunning && !storageData.pausedAt) {
            resumedBeforePopupDismiss = true;
            startTime = startedAt - elapsedPausedTime;
        } else if (storageData.pausedAt) {
            let startingPoint = new Date().getTime() - storageData.pausedAt;
            if (resumedBeforePopupDismiss) {
                startingPoint = new Date().getTime();
            }

            if (manualStart) {
                storageData.pausedAt = null;
                resumedBeforePopupDismiss = true;
                await chrome.storage.session.remove(['pausedAt']);
            };
            if(!resumedBeforePopupDismiss) await chrome.storage.session.set({ startedAt: startingPoint });
            startTime = startingPoint - elapsedPausedTime;
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
            const isPaused = await getStopwatchPausedState();

            if (isRunning) {
                await initStopwatch(true);
            } else if (!isRunning && manualStart) {
                await initStopwatch(isRunning, isPaused, true);
                await setStopwatchRunningState(true);
                await setStopwatchPausedState(false);
            } else {
                if (isPaused) {
                    await initStopwatch(false, true);
                }
            }

            return isRunning;
        } catch (error) {
            console.log('Error occurred:', error);
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
