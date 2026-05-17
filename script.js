/**
 * TaskFlow - Professional Todo App
 * Logic: State-based rendering with Local Storage
 */

// --- Selectors ---
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const taskCountText = document.getElementById('task-count');
const dateText = document.getElementById('current-date');
const emptyState = document.getElementById('empty-state');
const themeToggle = document.getElementById('theme-toggle');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');
const errorMsg = document.getElementById('error-msg');

// --- State ---
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    renderTasks();
    initTheme();
});

// --- Date Display ---
function updateDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    dateText.innerText = new Date().toLocaleDateString('en-US', options);
}

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

// --- CRUD Operations ---

// Add Task
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();

    if (text === '') {
        errorMsg.style.display = 'block';
        return;
    }

    errorMsg.style.display = 'none';
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.unshift(newTask);
    saveAndRender();
    todoInput.value = '';
});

// Delete Task
function deleteTask(id) {
    const element = document.querySelector(`[data-id="${id}"]`);
    element.classList.add('slide-out');
    
    element.addEventListener('animationend', () => {
        tasks = tasks.filter(task => task.id !== id);
        saveAndRender();
    });
}

// Toggle Complete
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) return { ...task, completed: !task.completed };
        return task;
    });
    saveAndRender();
}

// Edit Task
function editTask(id, newText) {
    if (newText.trim() === '') return;
    tasks = tasks.map(task => {
        if (task.id === id) return { ...task, text: newText };
        return task;
    });
    saveAndRender();
}

// --- Filters & Rendering ---

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.completed);
    saveAndRender();
});

function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    let filteredTasks = tasks;
    if (currentFilter === 'pending') filteredTasks = tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') filteredTasks = tasks.filter(t => t.completed);

    todoList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);
            li.innerHTML = `
                <div class="todo-checkbox" onclick="toggleTask(${task.id})">
                    <i class="fa-solid fa-check"></i>
                </div>
                <span class="todo-text" contenteditable="true" onblur="editTask(${task.id}, this.innerText)">${task.text}</span>
                <div class="task-actions">
                    <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            todoList.appendChild(li);
        });
    }

    // Update Counter
    const pendingCount = tasks.filter(t => !t.completed).length;
    taskCountText.innerText = `${pendingCount} task${pendingCount !== 1 ? 's' : ''} remaining`;
}