'use strict';

const createStopwatch = () => {
    let startTime = null;
    let stopwatchInterval = null;
    let elapsedPausedTime = 0;
    let timeTrackedDisplay = null;

    const startStopwatch = ( displayElement ) => {
        timeTrackedDisplay = displayElement;
        if (!stopwatchInterval) {
            startTime = new Date().getTime() - elapsedPausedTime;
            stopwatchInterval = setInterval(updateStopwatch, 1000);
        }
    };

    const pauseStopwatch = () => {
        clearInterval(stopwatchInterval);
        elapsedPausedTime = new Date().getTime() - startTime;
        stopwatchInterval = null;
    };

    const resetStopwatch = () => {
        pauseStopwatch();
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

    return {startStopwatch, pauseStopwatch, resetStopwatch};
};

export default createStopwatch;
