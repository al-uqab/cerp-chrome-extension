document.addEventListener('DOMContentLoaded', function() {
    const hourDisplay = document.getElementById('hour');
    const minuteDisplay = document.getElementById('minutes');
    const secondDisplay = document.getElementById('seconds');
    const startButton = document.getElementById('startTaskButton');
    const pauseButton = document.getElementById('pauseTaskButton');
    const endButton = document.getElementById('endTaskButton');

    let timerInterval;
    let isTimerRunning = false;
    let startTime;
    let pausedTime = 0; // Variable to store time when paused

    // Function to start the timer
    function startTimer(taskTitle) {
        let initialTime = pausedTime; // Use paused time as the initial time

        timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            const totalSeconds = initialTime + elapsedTime;

            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const secs = totalSeconds % 60;

            hourDisplay.innerText = String(hours).padStart(2, '0');
            minuteDisplay.innerText = String(minutes).padStart(2, '0');
            secondDisplay.innerText = String(secs).padStart(2, '0');
        }, 1000);
    }

    // Function to pause the timer
    function pauseTimer() {
        clearInterval(timerInterval);
        pausedTime += Math.floor((Date.now() - startTime) / 1000);
        isTimerRunning = false;
    }

    // Function to reset the timer
    function resetTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        pausedTime = 0;
        hourDisplay.innerText = '00';
        minuteDisplay.innerText = '00';
        secondDisplay.innerText = '00';
        chrome.storage.local.remove(['activeTask', 'startTime']);
    }

    // Retrieve the active task and start time from storage when the popup is opened
    chrome.storage.local.get(['activeTask', 'startTime'], function(result) {
        const activeTask = result.activeTask;
        startTime = result.startTime;

        if (activeTask && startTime) {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            pausedTime = result.pausedTime || 0; // Retrieve paused time if available

            if (elapsedTime - pausedTime > 0) {
                startTimer(activeTask);
                isTimerRunning = true;
                startButton.style.display = 'none'; // Hide start button when timer is running
                pauseButton.style.display = 'inline-block'; // Show pause button when timer is running
            }
        }
    });

    // Event listener for the start/pause button
    startButton.addEventListener('click', function() {
        const taskTitle = this.closest('.ce-tasks__task').querySelector('.ce-task__title').innerText;
        console.log(`Button clicked for task: ${taskTitle}`);

        if (isTimerRunning) {
            pauseTimer();
            startButton.style.display = 'inline-block'; // Show start button when paused
            pauseButton.style.display = 'none'; // Hide pause button when paused
        } else {
            startTime = Date.now();
            chrome.storage.local.set({ 'activeTask': taskTitle, 'startTime': startTime });

            startTimer(taskTitle);
            isTimerRunning = true;
            startButton.style.display = 'none'; // Hide start button when timer is running
            pauseButton.style.display = 'inline-block'; // Show pause button when timer is running
        }
    });

    // Event listener for the pause button
    pauseButton.addEventListener('click', function() {
        if (isTimerRunning) {
            pauseTimer();
            startButton.style.display = 'inline-block'; // Show start button when paused
            pauseButton.style.display = 'none'; // Hide pause button when paused
        }
    });

    // Event listener for the end button
    endButton.addEventListener('click', function() {
        console.log('End button clicked');
        resetTimer();
        startButton.style.display = 'inline-block'; // Show start button when timer is reset
        pauseButton.style.display = 'none'; // Hide pause button when timer is reset
    });
});
