document.addEventListener('DOMContentLoaded', function() {
    const startButtons = document.querySelectorAll('.ce-tasks__task .ce-task__action#startTaskButton');

    startButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const taskTitle = this.closest('.ce-tasks__task').querySelector('.ce-task__title').innerText;
            console.log(`Starting timer for task: ${taskTitle}`);

            // Send a message to the background script to start the timer
            chrome.runtime.sendMessage({ action: 'startTimer' });

            // Store the task title and start time in storage
            chrome.storage.local.set({ 'activeTask': taskTitle, 'startTime': Date.now() });
        });
    });

    // Retrieve the active task and start time from storage when the popup is opened
    chrome.storage.local.get(['activeTask', 'startTime'], function(result) {
        const activeTask = result.activeTask;
        const startTime = result.startTime;

        if (activeTask && startTime) {
            const hourDisplay = document.getElementById('hour');
            const minuteDisplay = document.getElementById('minutes');
            const secondDisplay = document.getElementById('seconds');

            if (hourDisplay && minuteDisplay && secondDisplay) {
                let seconds = Math.floor((Date.now() - startTime) / 1000);

                const timer = setInterval(() => {
                    seconds++;
                    const hours = Math.floor(seconds / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);
                    const secs = seconds % 60;

                    hourDisplay.innerText = String(hours).padStart(2, '0');
                    minuteDisplay.innerText = String(minutes).padStart(2, '0');
                    secondDisplay.innerText = String(secs).padStart(2, '0');
                }, 1000);

                // Simulated duration for demonstration purposes (remove this in actual implementation)
                setTimeout(() => {
                    console.log(`Stopped timer for task: ${activeTask}`);
                    clearInterval(timer);

                    // Send a message to the background script to stop the timer
                    chrome.runtime.sendMessage({ action: 'stopTimer' });

                    // Clear storage for the completed task
                    chrome.storage.local.remove(['activeTask', 'startTime']);
                }, 60000); // Simulated 60-second duration for the task
            } else {
                console.error('Timer display elements not found');
            }
        }
    });
});
