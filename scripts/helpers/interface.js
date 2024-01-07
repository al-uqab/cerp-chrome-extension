'use strict';

import storage         from './storage.js';
import api             from './api.js';
import createStopwatch from './stopwatch.js';

const storageData = storage.getValues();
const stopwatch = createStopwatch();

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
                console.error('Error fetching preloader HTML:', error);
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
            usernameElement.textContent = storageData.userName;
            return true;
        }
        return false;
    },

    buildTasks: async () => {
        try {
            const tasks = await api.fetchTasks();
            if (!tasks || tasks.code !== 200) {
                return;
            }

            const {mainKeyword: taskTitle, tasks: taskSubTasks} = tasks.data[0];

            const firstIncompleteTask = taskSubTasks.find(task => !task.completed);
            const remainingTasks = taskSubTasks.filter(task => task !== firstIncompleteTask);

            const currentTaskContent = document.querySelector('.ce-task__title--main');
            const currentTaskTitle = document.querySelector('.ce-task__title--task');
            currentTaskContent.innerText = `${taskTitle}:`;
            currentTaskTitle.innerText = firstIncompleteTask?.requirement || '';

            const tasksContainer = document.querySelector('.ce-timetracking__tasks');
            tasksContainer.innerHTML = '';

            remainingTasks.forEach(task => {
                const article = createTaskElement('article', 'ce-tasks__task');
                article.setAttribute('data-id', task.id);

                const h5 = createTaskElement('h5', 'ce-task__title');
                h5.style.opacity = '0.5';
                h5.textContent = task.requirement;

                article.appendChild(h5);
                tasksContainer.appendChild(article);
            });
        } catch (error) {
            console.error('Error building tasks:', error);
            console.error(error.stack); // log error stack trace for debugging purposes
        }
    },

    buildSessions: async () => {
        try {
            const sessions = await api.fetchSessions();
            if (!sessions || sessions.code !== 200 || !Array.isArray(sessions.data)) {
                return;
            }

            const pastSessionsContainer = document.querySelector('.ce-sessions__past--sessions');
            pastSessionsContainer.innerHTML = '';

            sessions.data.forEach(session => {
                const sessionElement = createSessionElement(session);
                pastSessionsContainer.appendChild(sessionElement);
            });
        } catch (error) {
            console.error('Error building sessions:', error);
            console.error(error.stack); // log error stack trace for debugging purposes
        }
    },
};

const createTaskElement = ( tagName, className ) => {
    const element = document.createElement(tagName);
    element.classList.add(className);
    return element;
};

const formatLoggedTime = ( loggedMinutes ) => {
    const hours = Math.floor(loggedMinutes / 60);
    const minutes = loggedMinutes % 60;
    const seconds = 0; // Assuming seconds are always 0 in this context

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

const createSessionElement = ( task ) => {
    const article = createTaskElement('article', 'ce-sessions__session');
    const sessionTitle = createTaskElement('div', 'ce-sessions__session--title');

    const editIcon = document.createElement('div');
    editIcon.innerHTML = '<img alt="Edit icon" src="images/edit.svg">';
    sessionTitle.appendChild(editIcon);

    const sessionTask = createTaskElement('h5', 'ce-sessions__session--task');
    const taskRequirement = document.createTextNode(task.task.requirement);
    const taskLoggedTime = createTaskElement('span', 'ce-sessions__session--highlight');
    taskLoggedTime.textContent = formatLoggedTime(task.loggedMinutes);

    sessionTask.appendChild(taskRequirement);
    sessionTask.appendChild(taskLoggedTime);
    sessionTitle.appendChild(sessionTask);

    article.appendChild(sessionTitle);

    const sessionActions = createTaskElement('div', 'ce-sessions__session--actions');

    const correctIcon = document.createElement('img');
    correctIcon.src = 'images/icons/correct.svg';
    sessionActions.appendChild(correctIcon);

    const syncIcon = document.createElement('img');
    syncIcon.src = 'images/icons/sync-exclamation.svg';
    sessionActions.appendChild(syncIcon);

    article.appendChild(sessionActions);

    return article;
};

export default ui;
