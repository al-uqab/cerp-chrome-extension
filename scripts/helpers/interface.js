'use strict';

import storage from './storage.js';
import api from './api.js';

const storageData = storage.getValues();

const ui = {
    injectPreloader: () => {
        fetch(chrome.runtime.getURL('preloader.html'))
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const preloader = doc.documentElement;

                // Inject the preloader into the current page
                document.documentElement.appendChild(preloader);
            })
            .catch(error => {
                console.log('Error fetching preloader HTML:', error);
            });
    },

    removePreloader: () => {
        const preloaderElement = document.getElementById('ce-preloader-html');

        if (preloaderElement) {
            preloaderElement.remove();
        }
    },

    setUser: () => {
        const usernameElement = document.getElementById('userName');
        if (usernameElement) {
            usernameElement.textContent = `Hello, ${storageData.userName}`;
            return true;
        }
        return false;
    },

    setProfilePicture: async () => {
        try {
            let userProfilePicture = null;
            if (storageData.userProfilePicture) {
                userProfilePicture = storageData.userProfilePicture;
            } else {
                const userSettings = await api.getUserSettings();

                if (userSettings.data?.profileImage) {
                    userProfilePicture = userSettings.data.profileImage;
                    storage.setValues({ userProfilePicture: userProfilePicture });
                }
            }

            if (userProfilePicture) {
                const profilePictureElement = document.getElementById('user-profile-picture');
                profilePictureElement.src = userProfilePicture;
            }
        } catch (error) {
            console.log('Error building user profile picutre:', error);
            console.log(error.stack); // log error stack trace for debugging purposes
        }
    },

    buildStats: async () => {
        try {
            const stats = await api.getUserStats();
            const weekStats = await api.getUserWeekStats();
            const weekSessions = await api.getUserWeekSessions();
            if (stats.code === 200 && weekStats.code === 200 && weekSessions.code === 200) {
                const element = document.getElementById('week-tracked-time');
                const sessionsElement = document.getElementById('week-tracked-sessions');
                const lastWeekElement = document.getElementById('last-week-tracked-time');
                element.innerText = `${weekStats.data} Minutes`;
                lastWeekElement.innerText = `${stats.data} Minutes`;
                sessionsElement.innerText = `${weekSessions.data.length} Sessions`;
                return;
            }
        } catch (error) {
            console.log('Error building stats:', error);
            console.log(error.stack); // log error stack trace for debugging purposes
        }
    },

    buildTasks: async () => {
        let currentTaskId;
        try {
            const tasks = await api.fetchTasks();
            if (!tasks || tasks.code !== 200) {
                return;
            }

            const taskTitle = tasks.data.content.mainKeyword;
            const taskSubTasks = tasks.data.subtasks;

            const firstIncompleteTask = taskSubTasks.find(task => !task.completed);
            // const remainingTasks = taskSubTasks.filter(task => task !== firstIncompleteTask);

            const currentTaskContent = document.querySelector('.ce-task__title--main');
            const currentTaskTitle = document.querySelector('.ce-task__title--task');
            currentTaskContent.innerText = `${taskTitle}`;
            currentTaskTitle.innerText = firstIncompleteTask?.description || '';

            const tasksContainer = document.querySelector('.ce-timetracking__tasks');
            tasksContainer.innerHTML = '';

            currentTaskId = tasks.data.id;

            const userAccountIcon = document.createElement('img');
            userAccountIcon.classList.add('ce-user-details__link-icon');
            userAccountIcon.setAttribute('width', '12');
            userAccountIcon.setAttribute('height', '12');
            userAccountIcon.setAttribute('src', 'images/icons/external-link-white.svg');

            const accountLink = document.createElement('a');
            accountLink.setAttribute('id', 'account-link');
            accountLink.setAttribute('href', 'https://app.contenterp.com/');
            accountLink.setAttribute('target', '_blank');
            accountLink.appendChild(userAccountIcon);

            const container = document.createElement('div');

            container.setAttribute('id', 'main-task-container');
            container.appendChild(currentTaskContent);
            container.appendChild(accountLink);

            tasksContainer.appendChild(container);

            // remainingTasks.unshift(firstIncompleteTask);
            // const tasksToDisplay = remainingTasks;
            taskSubTasks.forEach(task => {
                const article = createTaskElement('article', 'ce-tasks__task');

                const h5 = createTaskElement('h5', 'ce-task__title');
                h5.textContent = task.description;

                const checkmarkImg = document.createElement('img');
                checkmarkImg.classList.add('ce-task__checkmark');
                checkmarkImg.setAttribute('width', '12');
                checkmarkImg.setAttribute('height', '12');
                checkmarkImg.setAttribute('src', 'images/icons/checkmark.svg');

                const emptyBox = document.createElement('span');
                emptyBox.classList.add('ce-task__emptybox');

                if (task.completed) {
                    article.appendChild(checkmarkImg);
                    h5.style.opacity = '0.5';
                } else {
                    article.appendChild(emptyBox);
                };
                article.appendChild(h5);
                tasksContainer.appendChild(article);
            });
        } catch (error) {
            console.log('Error building tasks:', error);
            console.log(error.stack); // log error stack trace for debugging purposes
        }

        return currentTaskId;
    },

    buildSessions: async () => {
        try {
            const sessions = await api.fetchSessions();
            if (!sessions || sessions.code !== 200 || !Array.isArray(sessions.data)) {
                return;
            }

            const pastSessionsContainer = document.querySelector('.ce-sessions__past--sessions');
            pastSessionsContainer.innerHTML = '';

            const totalSessions = sessions.data.length;
            const lastThreeSessions = sessions.data.slice(Math.max(totalSessions - 3, 0));

            const reversedSessions = lastThreeSessions.reverse();
            reversedSessions.forEach(session => {
                const sessionElement = createSessionElement(session);
                pastSessionsContainer.appendChild(sessionElement);
            });
        } catch (error) {
            console.log('Error building sessions:', error);
            console.log(error.stack); // log error stack trace for debugging purposes
        }
    },

    setLastSynced: () => {
        const lastSyncedElement = document.getElementById('last-synced');

        if (storageData.lastSynced) {
            const timeAgo = calculateLastSynced(storageData.lastSynced);
            lastSyncedElement.innerText = `Last Synced: ${timeAgo}`;
        }
    },

    buildSettings: () => {
        setInterval(() => {
            ui.setLastSynced();
        }, 1000);

        const nameElement = document.querySelector('.ce-user-details__name');
        const userFullName = storageData.userFullName;
        if (nameElement && userFullName) {
            nameElement.innerText = userFullName;
        }

        const roleElement = document.querySelector('.ce-user-details__role');
        const userRole = storageData.userRole;
        if (roleElement && userRole) {
            roleElement.innerText = userRole;
        }

        const memberSinceElement = document.querySelector('.ce-user-details__member-since');
        const memberSince = storageData.memberSince;
        if (memberSinceElement && memberSince) {
            const memberSinceDate = new Date(memberSince);
            const formattedDate = `${memberSinceDate.getDate()} ${getMonthAbbreviation(memberSinceDate.getMonth())} ${memberSinceDate.getFullYear()}`;

            memberSinceElement.innerText = `Member Since: ${formattedDate}`;
        }
    }
};

const createTaskElement = (tagName, className) => {
    const element = document.createElement(tagName);
    element.classList.add(className);
    return element;
};

const formatLoggedTime = (loggedMinutes) => {
    const hours = Math.floor(loggedMinutes / 60);
    const minutes = loggedMinutes % 60;
    const seconds = 0; // Assuming seconds are always 0 in this context

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

const createSessionElement = (task) => {
    const article = createTaskElement('article', 'ce-sessions__session');
    const sessionTitle = createTaskElement('div', 'ce-sessions__session--title');

    const editIcon = document.createElement('div');
    editIcon.innerHTML = '<img alt="Edit icon" src="images/edit.svg">';
    sessionTitle.appendChild(editIcon);

    const sessionTask = createTaskElement('h5', 'ce-sessions__session--task');
    const taskRequirement = document.createTextNode(task.task.content.mainKeyword);
    const taskLoggedTime = createTaskElement('span', 'ce-sessions__session--highlight');
    taskLoggedTime.textContent = formatLoggedTime(task.loggedMinutes);
    const taskStatus = createTaskElement('span', 'ce-sessions__session--highlight');
    const statusText = task.task.content.status.replace(/_/g, ' ').toLowerCase();
    taskStatus.textContent = statusText;

    taskStatus.style.fontWeight = 'bold';
    taskStatus.style.fontStyle = 'italic';

    sessionTask.appendChild(taskRequirement);
    sessionTask.appendChild(taskLoggedTime);
    sessionTask.appendChild(taskStatus);
    sessionTitle.appendChild(sessionTask);

    article.appendChild(sessionTitle);

    const sessionActions = createTaskElement('div', 'ce-sessions__session--actions');

    const correctIcon = document.createElement('img');
    correctIcon.src = 'images/icons/correct.svg';
    sessionActions.appendChild(correctIcon);

    const syncIcon = document.createElement('img');
    syncIcon.src = 'images/icons/sync-exclamation.svg';
    /*
     * TODO: Implement logic to display this icon
     *       when the session is completed locally but
     *       hasn't been synced with the server yet.
     */
    // sessionActions.appendChild(syncIcon);


    article.appendChild(sessionActions);

    return article;
};

const getMonthAbbreviation = (monthIndex) => {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthIndex];
};

const calculateLastSynced = (lastSynced) => {
    // Calculate the time difference
    const lastSyncedTime = new Date(lastSynced);
    const currentTime = new Date();
    const timeDifferenceInSeconds = Math.floor((currentTime - lastSyncedTime) / 1000);

    if (timeDifferenceInSeconds < 60) {
        return `${timeDifferenceInSeconds} s ago`;
    } else if (timeDifferenceInSeconds < 3600) {
        const minutes = Math.floor(timeDifferenceInSeconds / 60);
        return `${minutes} m ago`;
    } else {
        const hours = Math.floor(timeDifferenceInSeconds / 3600);
        return `${hours} h ago`;
    }
}

export default ui;
