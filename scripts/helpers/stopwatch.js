'use strict';

const createStopwatch = () => {
    let startTime = null;
    let stopwatchInterval = null;
    let elapsedPausedTime = 0;
    let timeTrackedDisplay = null;
    let currentTaskId = null;

    const setCurrentTaskId = (id) => {
        currentTaskId = id;
    };

    const startStopwatch = async ( displayElement ) => {
        console.log(currentTaskId);
        let startedAt;
        let isRunning;
        timeTrackedDisplay = displayElement;

        try {
            const storageData = await new Promise(( resolve, reject ) => {
                chrome.storage.local.get(['startedAt', 'pausedAt'], ( result ) => {
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
                startedAt = new Date().getTime();

                // Update the 'startedAt' value in storage
                await new Promise(( resolve, reject ) => {
                    chrome.storage.local.set({startedAt: startedAt}, () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve();
                        }
                    });
                });
            }

            if (storageData.pausedAt) {
                startTime = startedAt - storageData.pausedAt;
            } else {
                startTime = startedAt - elapsedPausedTime;
            }

            if (!stopwatchInterval) {
                stopwatchInterval = setInterval(updateStopwatch, 1000);
            }
        } catch (error) {
            console.error('Error occurred:', error);
        }

        return isRunning;
    };

    const pauseStopwatch = ( isReset = false ) => {
        clearInterval(stopwatchInterval);
        elapsedPausedTime = new Date().getTime() - startTime;
        stopwatchInterval = null;

        if (isReset) {
            // Remove both 'startedAt' and 'pausedAt' from storage
            return chrome.storage.local.remove(['startedAt', 'pausedAt']);
        } else {
            // Update 'pausedAt' value in storage
            return chrome.storage.local.set({ pausedAt: elapsedPausedTime });
        }
    };

    const resetStopwatch = () => {
        pauseStopwatch(true);
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
