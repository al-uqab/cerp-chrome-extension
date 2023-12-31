"use strict"

document.addEventListener('DOMContentLoaded', () => {
    const hourDisplay = document.getElementById('hour');
    const minuteDisplay = document.getElementById('minutes');
    const secondDisplay = document.getElementById('seconds');
    const startButton = document.getElementById('startTaskButton');
    const pauseButton = document.getElementById('pauseTaskButton');
    const endButton = document.getElementById('endTaskButton');

    let timerInterval;
    let isTimerRunning = false;
    let startTime;
    let pausedTime = 0;

    const updateTimerDisplay = () => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const totalSeconds = pausedTime + elapsedTime;

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        hourDisplay.innerText = String(hours).padStart(2, '0');
        minuteDisplay.innerText = String(minutes).padStart(2, '0');
        secondDisplay.innerText = String(seconds).padStart(2, '0');
    };

    const startTimer = (taskTitle) => {
        const initialTime = pausedTime;
        timerInterval = setInterval(updateTimerDisplay, 1000);
    };

    const pauseTimer = () => {
        clearInterval(timerInterval);
        pausedTime += Math.floor((Date.now() - startTime) / 1000);
        isTimerRunning = false;
        chrome.storage.local.set({'pausedTime': pausedTime});
    };

    const resetTimer = () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        pausedTime = 0;
        [hourDisplay, minuteDisplay, secondDisplay].forEach(display => display.innerText = '00');
        chrome.storage.local.remove(['activeTask', 'startTime', 'pausedTime']);
    };

    const handleStartButtonClick = () => {
        const taskTitle = startButton.closest('.ce-tasks__task').querySelector('.ce-task__title').innerText;

        if (isTimerRunning) {
            pauseTimer();
        } else {
            startTime = Date.now() - pausedTime * 1000;
            chrome.storage.local.set({'activeTask': taskTitle, 'startTime': startTime});

            startTimer(taskTitle);
            isTimerRunning = true;
        }
        updateButtonDisplay();
    };

    const handlePauseButtonClick = () => {
        if (isTimerRunning) {
            pauseTimer();
            updateButtonDisplay();
        }
    };

    const handleEndButtonClick = () => {
        resetTimer();
        updateButtonDisplay();
    };

    const updateButtonDisplay = () => {
        startButton.style.display = isTimerRunning ? 'none' : 'inline-block';
        pauseButton.style.display = isTimerRunning ? 'inline-block' : 'none';
    };

    const getUsername = () => localStorage.getItem('username') || 'Guest User';

    const setInitialUsername = () => {
        const username = getUsername();
        const usernameElement = document.querySelector('.ce-timetracking__username');
        if (usernameElement) {
            usernameElement.textContent = username;
        }
    };

    startButton.addEventListener('click', handleStartButtonClick);
    pauseButton.addEventListener('click', handlePauseButtonClick);
    endButton.addEventListener('click', handleEndButtonClick);

    setInitialUsername();

    chrome.storage.local.get(['activeTask', 'startTime', 'pausedTime'], ({
                                                                             activeTask,
                                                                             startTime: storedStartTime,
                                                                             pausedTime: storedPausedTime
                                                                         }) => {
        startTime = storedStartTime || Date.now();
        pausedTime = storedPausedTime || 0;

        if (activeTask && startTime) {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

            if (isTimerRunning || (elapsedTime - pausedTime > 0 && pausedTime !== 0)) {
                startTimer(activeTask);
                isTimerRunning = true;
            } else if (pausedTime !== 0) {
                updateTimerDisplay();
            }
        }
        updateButtonDisplay();
    });
});
