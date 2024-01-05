'use strict';

import createStopwatch from './helpers/stopwatch.js';
import ui              from './helpers/interface.js';

const stopwatch = createStopwatch();
const getElement = ( id ) => document.getElementById(id);
const hideElement = ( element ) => {
    element.style.display = 'none';
};
const showElement = ( element, displayType = 'inline-block' ) => {
    element.style.display = displayType;
};

const initializeSessionControls = () => {
    const startSessionButton = getElement('startTaskButton');
    const pauseSessionButton = getElement('pauseTaskButton');
    const endSessionButton = getElement('endTaskButton');
    const timeTrackedDisplay = document.querySelector('.ce-timetracking-time');

    const pausedStyles = () => {
        hideElement(pauseSessionButton);
        showElement(startSessionButton);
    };

    const startedStyles = () => {
        hideElement(startSessionButton);
        showElement(pauseSessionButton);
    };

    const handleStartButtonClick = () => {
        stopwatch.startStopwatch(timeTrackedDisplay);
        startedStyles();
    };

    const handlePauseButtonClick = () => {
        stopwatch.pauseStopwatch();
        pausedStyles();
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
    await ui.setUser();
    await ui.buildTasks();
    await ui.buildSessions();
};

document.addEventListener('DOMContentLoaded', async () => {
    initializeSessionControls();
    await buildUI();
});
