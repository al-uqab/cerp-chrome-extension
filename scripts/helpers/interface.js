'use strict';

import storage from './storage.js';
import api     from './api.js';

const storageData = storage.getValues();
const ui = {
    setUser: () => {
        const usernameElement = document.getElementById('userName');
        if (usernameElement) {
            return usernameElement.textContent = storageData.userName;
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
        const sessions = await api.fetchSessions();
        if (sessions.code !== 200) return;
        if (!Array.isArray(sessions.data)) return;

        const pastSessionsContainer = document.querySelector('.ce-sessions__past--sessions');

        pastSessionsContainer.innerHTML = '';
        sessions.data.forEach(( session ) => {
            const sessionElement = createSessionElement(session);
            pastSessionsContainer.appendChild(sessionElement);
        });
    },
};

const createTaskElement = ( tagName, className ) => {
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
}

const createSessionElement = ( task ) => {
    const article = document.createElement('article');
    article.classList.add('ce-sessions__session');

    const sessionTitle = document.createElement('div');
    sessionTitle.classList.add('ce-sessions__session--title');

    const editIcon = document.createElement('div');
    editIcon.innerHTML = '<img alt="Edit icon" src="images/edit.svg">';
    sessionTitle.appendChild(editIcon);

    const sessionTask = document.createElement('h5');
    sessionTask.classList.add('ce-sessions__session--task');
    sessionTask.innerHTML = `${task.task.requirement}<span class="ce-sessions__session--highlight">${formatLoggedTime(task.loggedMinutes)}</span>`;
    sessionTitle.appendChild(sessionTask);

    article.appendChild(sessionTitle);

    const sessionActions = document.createElement('div');
    sessionActions.classList.add('ce-sessions__session--actions');

    const correctIcon = document.createElement('img');
    correctIcon.alt = '';
    correctIcon.src = 'images/icons/correct.svg';
    sessionActions.appendChild(correctIcon);

    const syncIcon = document.createElement('img');
    syncIcon.alt = '';
    syncIcon.src = 'images/icons/sync-exclamation.svg';

    article.appendChild(sessionActions);

    return article;
};

export default ui;
