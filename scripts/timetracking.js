'use strict';

import createStopwatch from './helpers/stopwatch.js';
import ui              from './helpers/interface.js';

ui.injectPreloader()

const stopwatch = createStopwatch();

const getElement = ( id ) => document.getElementById(id);
const hideElement = ( element ) => {
    element.style.display = 'none';
};
const showElement = ( element, displayType = 'inline-block' ) => {
    element.style.display = displayType;
};

const startSessionButton = getElement('startTaskButton');
const pauseSessionButton = getElement('pauseTaskButton');
const endSessionButton = getElement('endTaskButton');

const pausedStyles = () => {
    hideElement(pauseSessionButton);
    showElement(startSessionButton);
};

const startedStyles = () => {
    hideElement(startSessionButton);
    showElement(pauseSessionButton);
};

const initializeSessionControls = () => {
    const timeTrackedDisplay = document.querySelector('.ce-timetracking-time');

    const handleStartButtonClick = () => {
        stopwatch.startStopwatch(timeTrackedDisplay).then(r => startedStyles());
    };

    const handlePauseButtonClick = () => {
        stopwatch.pauseStopwatch().then(r => pausedStyles());
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
    await ui.buildTasks();
    await ui.buildSessions();
    return true;
};

document.addEventListener('DOMContentLoaded', async () => {
    const timeTrackedDisplay = document.querySelector('.ce-timetracking-time');
    await stopwatch.startStopwatch(timeTrackedDisplay).then(( isRunning ) => {
        if (isRunning) return startedStyles();
        return pausedStyles();
    });
    initializeSessionControls();
    await buildUI().then((built) => {
        if(built) return ui.removePreloader();
    });
});
