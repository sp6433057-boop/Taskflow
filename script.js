"use strict";

/* -----------------------------
   Application State
----------------------------- */

const STORAGE_KEY = "taskflow-pro-tasks";
const THEME_KEY = "taskflow-pro-theme";

const state = {
  tasks: loadTasks(),
  currentSection: "dashboard",
  editingTaskId: null,
  searchQuery: "",
  statusFilter: "all",
  priorityFilter: "all"
};

/* -----------------------------
   DOM Elements
----------------------------- */

const elements = {
  sidebar: document.getElementById("sidebar"),
  mobileMenuButton: document.getElementById("mobileMenuButton"),

  pageTitle: document.getElementById("pageTitle"),

  navItems: document.querySelectorAll(".nav-item"),
  pageSections: document.querySelectorAll(".page-section"),

  themeToggle: document.getElementById("themeToggle"),
  headerThemeToggle: document.getElementById("headerThemeToggle"),

  dashboardSection: document.getElementById("dashboardSection"),
  tasksSection: document.getElementById("tasksSection"),
  completedSection: document.getElementById("completedSection"),

  totalTasks: document.getElementById("totalTasks"),
  pendingTasks: document.getElementById("pendingTasks"),
  completedTasks: document.getElementById("completedTasks"),
  completionRate: document.getElementById("completionRate"),

  progressMessage: document.getElementById("progressMessage"),
  bannerProgress: document.getElementById("bannerProgress"),
  progressFill: document.getElementById("progressFill"),

  recentTaskList: document.getElementById("recentTaskList"),
  taskList: document.getElementById("taskList"),
  completedTaskList: document.getElementById("completedTaskList"),

  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  priorityFilter: document.getElementById("priorityFilter"),

  taskCountText: document.getElementById("taskCountText"),
  clearCompletedButton: document.getElementById("clearCompletedButton"),

  taskModal: document.getElementById("taskModal"),
  openTaskModal: document.getElementById("openTaskModal"),
  openTaskModalSecondary: document.getElementById("openTaskModalSecondary"),
  closeTaskModal: document.getElementById("closeTaskModal"),
  cancelTaskModal: document.getElementById("cancelTaskModal"),

  taskForm: document.getElementById("taskForm"),
  modalTitle: document.getElementById("modalTitle"),
  submitTaskText: document.getElementById("submitTaskText"),

  taskTitle: document.getElementById("taskTitle"),
  taskDescription: document.getElementById("taskDescription"),
  taskPriority: document.getElementById("taskPriority"),
  taskDueDate: document.getElementById("taskDueDate"),

  toast: document.getElementById("toast"),
  toastTitle: document.getElementById("toastTitle"),
  toastMessage: document.getElementById("toastMessage"),
  closeToast: document.getElementById("closeToast")
};

/* -----------------------------
   Initialization
----------------------------- */

function initializeApp() {
  applySavedTheme();
  bindEvents();
  renderApplication();
}

function bindEvents() {
  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const section = item.dataset.section;

      if (section) {
        switchSection(section);
        elements.sidebar.classList.remove("open");
      }
    });
  });

  document.querySelectorAll("[data-section-link]").forEach((button) => {
    button.addEventListener("click", () => {
      switchSection(button.dataset.sectionLink);
    });
  });

  elements.mobileMenuButton.addEventListener("click", () => {
    elements.sidebar.classList.toggle("open");
  });

  elements.openTaskModal.addEventListener("click", () => {
    openTaskModal();
  });

  elements.openTaskModalSecondary.addEventListener("click", () => {
    openTaskModal();
  });

  elements.closeTaskModal.addEventListener("click", closeTaskModal);
  elements.cancelTaskModal.addEventListener("click", closeTaskModal);

  elements.taskModal.addEventListener("click", (event) => {
    if (event.target === elements.taskModal) {
      closeTaskModal();
    }
  });

  elements.taskForm.addEventListener("submit", handleTaskSubmit);

  elements.searchInput.addEventListener("input", (event) => {
    state.searchQuery = event.target.value.trim().toLowerCase();
    renderTasks();
  });

  elements.statusFilter.addEventListener("change", (event) => {
    state.statusFilter = event.target.value;
    renderTasks();
  });

  elements.priorityFilter.addEventListener("change", (event) => {
    state.priorityFilter = event.target.value;
    renderTasks();
  });

  elements.clearCompletedButton.addEventListener(
    "click",
    clearCompletedTasks
  );

  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.headerThemeToggle.addEventListener("click", toggleTheme);

  elements.closeToast.addEventListener("click", hideToast);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeTaskModal();
      hideToast();
    }
  });
}

/* -----------------------------
   LocalStorage
----------------------------- */

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    console.error("Unable to load tasks:", error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

/* -----------------------------
   Navigation
----------------------------- */

function switchSection(sectionName) {
  state.currentSection = sectionName;

  elements.navItems.forEach((item) => {
    item.classList.toggle(
      "active",
      item.dataset.section === sectionName
    );
  });

  elements.pageSections.forEach((section) => {
    section.classList.remove("active");
  });

  const selectedSection = document.getElementById(
    `${sectionName}Section`
  );

  if (selectedSection) {
    selectedSection.classList.add("active");
  }

  const titles = {
    dashboard: "Good morning, Student",
    tasks: "Manage your tasks",
    completed: "Your completed work"
  };

  elements.pageTitle.textContent =
    titles[sectionName] || titles.dashboard;

  renderApplication();
}

/* -----------------------------
   Rendering
----------------------------- */

function renderApplication() {
  renderStatistics();
  renderProgress();
  renderRecentTasks();
  renderTasks();
  renderCompletedTasks();
}

function renderStatistics() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  elements.totalTasks.textContent = total;
  elements.pendingTasks.textContent = pending;
  elements.completedTasks.textContent = completed;
  elements.completionRate.textContent = `${rate}%`;
}

function renderProgress() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((task) => task.completed).length;
  const percentage =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  elements.bannerProgress.textContent = `${percentage}%`;
  elements.progressFill.style.width = `${percentage}%`;

  if (total === 0) {
    elements.progressMessage.textContent =
      "Start adding tasks to begin";
  } else if (percentage === 100) {
    elements.progressMessage.textContent =
      "Excellent! Everything is completed";
  } else if (percentage >= 70) {
    elements.progressMessage.textContent =
      "Great progress! Keep going";
  } else if (percentage >= 40) {
    elements.progressMessage.textContent =
      "You are making good progress";
  } else {
    elements.progressMessage.textContent =
      "Stay focused and complete your goals";
  }
}

function renderRecentTasks() {
  const recentTasks = [...state.tasks]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  elements.recentTaskList.innerHTML = "";

  if (recentTasks.length === 0) {
    elements.recentTaskList.innerHTML = createEmptyState(
      "No tasks yet",
      "Create your first task to start organizing your work.",
      "fa-clipboard-list"
    );
    return;
  }

  recentTasks.forEach((task) => {
    elements.recentTaskList.appendChild(createTaskElement(task));
  });
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();

  elements.taskList.innerHTML = "";

  if (filteredTasks.length === 0) {
    elements.taskList.innerHTML = createEmptyState(
      "No matching tasks",
      "Try changing your filters or create a new task.",
      "fa-magnifying-glass"
    );
  } else {
    filteredTasks.forEach((task) => {
      elements.taskList.appendChild(createTaskElement(task));
    });
  }

  elements.taskCountText.textContent =
    `${filteredTasks.length} ${
      filteredTasks.length === 1 ? "task" : "tasks"
    }`;
}

function renderCompletedTasks() {
  const completedTasks = state.tasks.filter(
    (task) => task.completed
  );

  elements.completedTaskList.innerHTML = "";

  if (completedTasks.length === 0) {
    elements.completedTaskList.innerHTML = createEmptyState(
      "Nothing completed yet",
      "Completed tasks will appear here.",
      "fa-circle-check"
    );
    return;
  }

  completedTasks.forEach((task) => {
    elements.completedTaskList.appendChild(createTaskElement(task));
  });
}

function createTaskElement(task) {
  const article = document.createElement("article");
  article.className = `task-item ${
    task.completed ? "completed" : ""
  }`;

  const dueDateHTML = task.dueDate
    ? `
      <span class="task-date ${
        isOverdue(task) ? "overdue" : ""
      }">
        <i class="fa-regular fa-calendar"></i>
        ${isOverdue(task) ? "Overdue · " : ""}
        ${formatDate(task.dueDate)}
      </span>
    `
    : "";

  article.innerHTML = `
    <button
      class="task-check"
      data-action="toggle"
      data-id="${task.id}"
      title="Mark task as completed"
      aria-label="Toggle task completion"
    >
      <i class="fa-solid fa-check"></i>
    </button>

    <div class="task-main">
      <div class="task-title">${escapeHTML(task.title)}</div>

      ${
        task.description
          ? `<div class="task-description">${escapeHTML(
              task.description
            )}</div>`
          : ""
      }

      <div class="task-meta">
        <span class="task-badge ${task.priority}">
          <i class="fa-solid fa-flag"></i>
          ${task.priority}
        </span>

        ${dueDateHTML}
      </div>
    </div>

    <div class="task-actions">
      <button
        class="task-action-button"
        data-action="edit"
        data-id="${task.id}"
        title="Edit task"
      >
        <i class="fa-solid fa-pen"></i>
      </button>

      <button
        class="task-action-button delete"
        data-action="delete"
        data-id="${task.id}"
        title="Delete task"
      >
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `;

  article.addEventListener("click", handleTaskAction);

  return article;
}

function createEmptyState(title, message, icon) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">
        <i class="fa-solid ${icon}"></i>
      </div>

      <h4>${title}</h4>
      <p>${message}</p>
    </div>
  `;
}

/* -----------------------------
   Filtering
----------------------------- */

function getFilteredTasks() {
  return state.tasks
    .filter((task) => {
      if (state.statusFilter === "active") {
        return !task.completed;
      }

      if (state.statusFilter === "completed") {
        return task.completed;
      }

      return true;
    })
    .filter((task) => {
      if (state.priorityFilter === "all") {
        return true;
      }

      return task.priority === state.priorityFilter;
    })
    .filter((task) => {
      if (!state.searchQuery) {
        return true;
      }

      return (
        task.title.toLowerCase().includes(state.searchQuery) ||
        task.description.toLowerCase().includes(state.searchQuery)
      );
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

/* -----------------------------
   Task CRUD Operations
----------------------------- */

function handleTaskSubmit(event) {
  event.preventDefault();

  const title = elements.taskTitle.value.trim();
  const description = elements.taskDescription.value.trim();
  const priority = elements.taskPriority.value;
  const dueDate = elements.taskDueDate.value;

  if (!title) {
    showToast("Validation error", "Please enter a task title.");
    return;
  }

  if (state.editingTaskId) {
    const task = state.tasks.find(
      (item) => item.id === state.editingTaskId
    );

    if (task) {
      task.title = title;
      task.description = description;
      task.priority = priority;
      task.dueDate = dueDate;

      saveTasks();
      closeTaskModal();
      renderApplication();

      showToast(
        "Task updated",
        "Your task was updated successfully."
      );
    }
  } else {
    const newTask = {
      id: Date.now(),
      title,
      description,
      priority,
      dueDate,
      completed: false,
      createdAt: Date.now()
    };

    state.tasks.unshift(newTask);

    saveTasks();
    closeTaskModal();
    renderApplication();

    showToast(
      "Task created",
      "Your new task was added successfully."
    );
  }
}

function toggleTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);

  if (!task) return;

  task.completed = !task.completed;

  saveTasks();
  renderApplication();

  showToast(
    task.completed ? "Task completed" : "Task reopened",
    task.completed
      ? "Great work! Keep going."
      : "The task is active again."
  );
}

function editTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);

  if (!task) return;

  state.editingTaskId = taskId;

  elements.modalTitle.textContent = "Edit Task";
  elements.submitTaskText.textContent = "Save Changes";

  elements.taskTitle.value = task.title;
  elements.taskDescription.value = task.description;
  elements.taskPriority.value = task.priority;
  elements.taskDueDate.value = task.dueDate;

  elements.taskModal.classList.add("active");
  elements.taskTitle.focus();
}

function deleteTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);

  if (!task) return;

  const confirmed = window.confirm(
    `Are you sure you want to delete "${task.title}"?`
  );

  if (!confirmed) return;

  state.tasks = state.tasks.filter(
    (item) => item.id !== taskId
  );

  saveTasks();
  renderApplication();

  showToast(
    "Task deleted",
    "The task was removed from your workspace."
  );
}

function clearCompletedTasks() {
  const completedCount = state.tasks.filter(
    (task) => task.completed
  ).length;

  if (completedCount === 0) {
    showToast(
      "Nothing to clear",
      "You do not have any completed tasks."
    );
    return;
  }

  const confirmed = window.confirm(
    `Delete ${completedCount} completed task(s)?`
  );

  if (!confirmed) return;

  state.tasks = state.tasks.filter(
    (task) => !task.completed
  );

  saveTasks();
  renderApplication();

  showToast(
    "Completed tasks cleared",
    "Your completed tasks were removed."
  );
}

/* -----------------------------
   Event Delegation
----------------------------- */

function handleTaskAction(event) {
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) return;

  const action = actionButton.dataset.action;
  const taskId = Number(actionButton.dataset.id);

  if (action === "toggle") {
    toggleTask(taskId);
  }

  if (action === "edit") {
    editTask(taskId);
  }

  if (action === "delete") {
    deleteTask(taskId);
  }
}

/* -----------------------------
   Modal
----------------------------- */

function openTaskModal() {
  state.editingTaskId = null;

  elements.modalTitle.textContent = "Create New Task";
  elements.submitTaskText.textContent = "Create Task";

  elements.taskForm.reset();
  elements.taskPriority.value = "medium";

  elements.taskModal.classList.add("active");
  elements.taskTitle.focus();
}

function closeTaskModal() {
  elements.taskModal.classList.remove("active");
  state.editingTaskId = null;
}

/* -----------------------------
   Theme
----------------------------- */

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "dark") {
    document.documentElement.dataset.theme = "dark";
    updateThemeIcons(true);
  } else {
    document.documentElement.dataset.theme = "light";
    updateThemeIcons(false);
  }
}

function toggleTheme() {
  const isDark =
    document.documentElement.dataset.theme === "dark";

  const nextTheme = isDark ? "light" : "dark";

  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem(THEME_KEY, nextTheme);

  updateThemeIcons(nextTheme === "dark");
}

function updateThemeIcons(isDark) {
  const icons = [
    elements.themeToggle.querySelector("i"),
    elements.headerThemeToggle.querySelector("i")
  ];

  icons.forEach((icon) => {
    icon.className = isDark
      ? "fa-solid fa-sun"
      : "fa-solid fa-moon";
  });

  const text = elements.themeToggle.querySelector("span");

  if (text) {
    text.textContent = isDark ? "Light Mode" : "Dark Mode";
  }
}

/* -----------------------------
   Toast Notifications
----------------------------- */

let toastTimeout;

function showToast(title, message) {
  elements.toastTitle.textContent = title;
  elements.toastMessage.textContent = message;

  elements.toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    hideToast();
  }, 3500);
}

function hideToast() {
  elements.toast.classList.remove("show");
}

/* -----------------------------
   Utility Functions
----------------------------- */

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${task.dueDate}T00:00:00`);

  return dueDate < today;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* -----------------------------
   Start Application
----------------------------- */

initializeApp();