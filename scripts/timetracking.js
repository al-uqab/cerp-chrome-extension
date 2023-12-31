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

    function startTimer(taskTitle) {
        const initialTime = pausedTime; // Use paused time as the initial time

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

    function pauseTimer() {
        clearInterval(timerInterval);
        pausedTime += Math.floor((Date.now() - startTime) / 1000);
        isTimerRunning = false;
        chrome.storage.local.set({ 'pausedTime': pausedTime }); // Save paused time to storage
    }

    function resetTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        pausedTime = 0;
        hourDisplay.innerText = '00';
        minuteDisplay.innerText = '00';
        secondDisplay.innerText = '00';
        chrome.storage.local.remove(['activeTask', 'startTime', 'pausedTime']);
    }

    chrome.storage.local.get(['activeTask', 'startTime', 'pausedTime'], function(result) {
        const activeTask = result.activeTask;
        startTime = result.startTime;

        if (activeTask && startTime) {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            pausedTime = result.pausedTime || 0;

            if (isTimerRunning || (elapsedTime - pausedTime > 0 && pausedTime !== 0)) {
                startTimer(activeTask);
                isTimerRunning = true;
                startButton.style.display = 'none';
                pauseButton.style.display = 'inline-block';
            } else if (pausedTime !== 0) {
                hourDisplay.innerText = String(Math.floor(pausedTime / 3600)).padStart(2, '0');
                minuteDisplay.innerText = String(Math.floor((pausedTime % 3600) / 60)).padStart(2, '0');
                secondDisplay.innerText = String(pausedTime % 60).padStart(2, '0');
            }
        }
    });

    startButton.addEventListener('click', function() {
        const taskTitle = this.closest('.ce-tasks__task').querySelector('.ce-task__title').innerText;

        if (isTimerRunning) {
            pauseTimer();
            startButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
        } else {
            startTime = Date.now() - pausedTime * 1000; // Adjust startTime based on pausedTime
            chrome.storage.local.set({ 'activeTask': taskTitle, 'startTime': startTime });

            startTimer(taskTitle);
            isTimerRunning = true;
            startButton.style.display = 'none';
            pauseButton.style.display = 'inline-block';
        }
    });

    pauseButton.addEventListener('click', function() {
        if (isTimerRunning) {
            pauseTimer();
            startButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
        }
    });

    endButton.addEventListener('click', function() {
        resetTimer();
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
    });
});