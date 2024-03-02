'use strict';

import createStopwatch from './helpers/stopwatch.js';
import ui from './helpers/interface.js';

ui.injectPreloader();

const stopwatch = createStopwatch();

const getElement = (id) => document.getElementById(id);
const hideElement = (element) => {
    element.style.display = 'none';
};
const showElement = (element, displayType = 'inline-flex') => {
    element.style.display = displayType;
};

const startSessionButton = getElement('startTaskButton');
const pauseSessionButton = getElement('pauseTaskButton');
const endSessionButton = getElement('endTaskButton');

const pausedStyles = () => {
    hideElement(endSessionButton);
    showElement(startSessionButton);
};

const startedStyles = () => {
    hideElement(startSessionButton);
    showElement(endSessionButton);
};

const initializeSessionControls = () => {
    const timeTrackedDisplay = document.querySelector('.ce-timetracking-time');

    const handleStartButtonClick = () => {
        startedStyles();
        stopwatch.startStopwatch(timeTrackedDisplay);
    };

    const handlePauseButtonClick = () => {
        pausedStyles()
        stopwatch.pauseStopwatch();
    };

    const handleEndButtonClick = () => {
        stopwatch.resetStopwatch();
        pausedStyles();
    };

    startSessionButton.addEventListener('click', handleStartButtonClick);
    pauseSessionButton.addEventListener('click', handlePauseButtonClick);
    endSessionButton.addEventListener('click', handleEndButtonClick);
};

const buildUI = async () => {
    ui.setUser();
    ui.setProfilePicture();
    await ui.buildStats();
    const currentTaskId = await ui.buildTasks();
    await ui.buildSessions();
    return { built: true, currentTaskId };
};

document.addEventListener('DOMContentLoaded', async () => {
    const timeTrackedDisplay = document.querySelector('.ce-timetracking-time');
    await stopwatch.startStopwatch(timeTrackedDisplay, false).then((isRunning) => {
        if (isRunning) return startedStyles();
        return pausedStyles();
    });
    initializeSessionControls();
    await buildUI().then(({ built, currentTaskId }) => {
        stopwatch.setCurrentTaskId(currentTaskId);
        if (built) return ui.removePreloader();
    });
});
