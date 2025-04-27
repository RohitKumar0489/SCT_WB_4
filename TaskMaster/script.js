document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const taskDateTime = document.getElementById('taskDateTime');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Task array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Initialize app
    function init() {
        renderTasks();
        setupEventListeners();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Add task
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
        
        // Filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderTasks();
            });
        });
    }
    
    // Add new task
    function addTask() {
        const text = taskInput.value.trim();
        const dueDate = taskDateTime.value;
        
        if (text === '') {
            alert('Please enter a task');
            return;
        }
        
        const newTask = {
            id: Date.now(),
            text,
            completed: false,
            dueDate: dueDate || null,
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        
        // Clear input fields
        taskInput.value = '';
        taskDateTime.value = '';
        taskInput.focus();
    }
    
    // Render tasks based on filter
    function renderTasks() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        
        let filteredTasks = [...tasks];
        
        if (activeFilter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (activeFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        taskList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="empty-message">No tasks found</p>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
        
        updateTaskStatuses();
    }
    
    // Create task DOM element
    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;
        
        // Format due date
        let dueDateText = '';
        let isOverdue = false;
        
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            
            dueDateText = dueDate.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            if (!task.completed && dueDate < now) {
                isOverdue = true;
                taskElement.classList.add('overdue');
            }
        }
        
        taskElement.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
            ${task.dueDate ? `
                <div class="task-due ${isOverdue ? 'overdue' : ''}">
                    <i class="far fa-clock"></i> ${dueDateText}
                </div>
            ` : ''}
            <div class="task-actions">
                <button class="edit-btn" title="Edit"><i class="far fa-edit"></i></button>
                <button class="delete-btn" title="Delete"><i class="far fa-trash-alt"></i></button>
            </div>
        `;
        
        // Add event listeners to the buttons
        const checkbox = taskElement.querySelector('.task-checkbox');
        const editBtn = taskElement.querySelector('.edit-btn');
        const deleteBtn = taskElement.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
        editBtn.addEventListener('click', () => editTask(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        return taskElement;
    }
    
    // Toggle task complete status
    function toggleTaskComplete(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
    }
    
    // Edit task
    function editTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const newText = prompt('Edit your task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            
            const newDate = prompt('Edit due date (leave empty to remove):', task.dueDate || '');
            task.dueDate = newDate || null;
            
            saveTasks();
            renderTasks();
        }
    }
    
    // Delete task
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
        }
    }
    
    // Update task statuses (overdue, etc.)
    function updateTaskStatuses() {
        const now = new Date();
        
        tasks.forEach(task => {
            if (!task.completed && task.dueDate) {
                const dueDate = new Date(task.dueDate);
                if (dueDate < now) {
                    const taskElement = document.querySelector(`.task-item[data-id="${task.id}"]`);
                    if (taskElement) {
                        taskElement.classList.add('overdue');
                        const dueElement = taskElement.querySelector('.task-due');
                        if (dueElement) {
                            dueElement.classList.add('overdue');
                        }
                    }
                }
            }
        });
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Initialize the app
    init();
});