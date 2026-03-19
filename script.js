const STORAGE_KEY = "taskflow_tasks";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const tagInput = document.getElementById("tagInput");
const errorMessage = document.getElementById("errorMessage");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");
const filterButtons = document.querySelectorAll(".filter-btn");
const tagFilter = document.getElementById("tagFilter");

let tasks = loadTasks();
let currentStatusFilter = "all";
let currentTagFilter = "all";

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);
  return savedTasks ? JSON.parse(savedTasks) : [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(text, tag) {
  const task = {
    id: Date.now(),
    text: text,
    tag: tag,
    done: false
  };

  tasks.push(task);
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, done: !task.done } : task
  );
  saveTasks();
  render();
}

function getFilteredTasks() {
  return tasks.filter(task => {
    const statusMatch =
      currentStatusFilter === "all" ||
      (currentStatusFilter === "active" && !task.done) ||
      (currentStatusFilter === "completed" && task.done);

    const tagMatch =
      currentTagFilter === "all" || task.tag === currentTagFilter;

    return statusMatch && tagMatch;
  });
}

function updateCounter() {
  const activeCount = tasks.filter(task => !task.done).length;
  taskCounter.textContent = `${activeCount} active task${activeCount === 1 ? "" : "s"}`;
}

function updateTagOptions() {
  const previousValue = currentTagFilter;
  const uniqueTags = [...new Set(tasks.map(task => task.tag).filter(Boolean))].sort();

  tagFilter.innerHTML = `<option value="all">All tags</option>`;

  uniqueTags.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });

  if (previousValue === "all" || uniqueTags.includes(previousValue)) {
    tagFilter.value = previousValue;
  } else {
    currentTagFilter = "all";
    tagFilter.value = "all";
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function render() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = "";

  updateCounter();
  updateTagOptions();

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<li class="empty">No tasks match your current filters.</li>`;
    return;
  }

  filteredTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item ${task.done ? "completed" : ""}`;

    item.innerHTML = `
      <input
        type="checkbox"
        ${task.done ? "checked" : ""}
        aria-label="Mark ${escapeHtml(task.text)} complete"
      />
      <div class="task-main">
        <p class="task-text">${escapeHtml(task.text)}</p>
        ${task.tag ? `<span class="tag">${escapeHtml(task.tag)}</span>` : ""}
      </div>
      <div class="task-actions">
        <button class="delete-btn" aria-label="Delete ${escapeHtml(task.text)}">Delete</button>
      </div>
    `;

    const checkbox = item.querySelector('input[type="checkbox"]');
    const deleteButton = item.querySelector(".delete-btn");

    checkbox.addEventListener("change", () => toggleTask(task.id));
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    taskList.appendChild(item);
  });
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();
  const tag = tagInput.value.trim().toLowerCase();

  if (!text) {
    errorMessage.textContent = "Task name is required.";
    taskInput.focus();
    return;
  }

  errorMessage.textContent = "";
  addTask(text, tag);
  taskForm.reset();
  taskInput.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentStatusFilter = button.dataset.filter;

    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    render();
  });
});

tagFilter.addEventListener("change", event => {
  currentTagFilter = event.target.value;
  render();
});

render();
