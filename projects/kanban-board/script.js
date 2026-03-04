"use strict";

/**
 * Kanban Task Manager (GitHub Pages Safe)
 * - No inline onclick
 * - Drag & drop
 * - Edit/Delete
 * - LocalStorage persistence
 */

const STORAGE_KEY = "mrstevenson.kanban.v1";

let tasks = [];
let draggingTaskId = null;

// ---------- Helpers ----------
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch {
    tasks = [];
  }
}

function setMessage(text, isError = false) {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.style.color = isError ? "#dc2626" : "#6b7280";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

// ---------- CRUD ----------
function addTask() {
  const input = document.getElementById("taskInput");
  const priorityEl = document.getElementById("priority");

  const text = input.value.trim();
  const priority = priorityEl.value;

  if (!text) {
    setMessage("Please enter a task.", true);
    return;
  }

  tasks.push({
    id: Date.now(),
    text,
    priority,
    status: "todo",
    createdAt: new Date().toISOString()
  });

  saveTasks();
  input.value = "";
  input.focus();
  setMessage("Task added.");
  render();
}

function deleteTask(id) {
  const ok = confirm("Delete this task?");
  if (!ok) return;

  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  setMessage("Task deleted.");
  render();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newText = prompt("Edit task title:", task.text);
  if (newText === null) return;

  const cleaned = newText.trim();
  if (!cleaned) {
    setMessage("Task title cannot be blank.", true);
    return;
  }

  task.text = cleaned;

  const newPriority = prompt("Priority (Low, Medium, High):", task.priority);
  if (newPriority !== null) {
    const p = newPriority.trim();
    if (["Low", "Medium", "High"].includes(p)) task.priority = p;
  }

  saveTasks();
  setMessage("Task updated.");
  render();
}

function moveTaskToStatus(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.status = newStatus;
  saveTasks();
  render();
}

// ---------- Rendering ----------
function render() {
  const zones = {
    todo: document.getElementById("todo"),
    inprogress: document.getElementById("inprogress"),
    done: document.getElementById("done"),
  };

  // Clear columns
  Object.values(zones).forEach(z => z.innerHTML = "");

  // Render tasks
  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task";
    div.draggable = true;
    div.dataset.id = String(task.id);

    div.innerHTML = `
      <div class="taskTop">
        <div class="taskTitle">${escapeHtml(task.text)}</div>
        <div class="taskBtns">
          <button type="button" class="smallBtn" data-action="edit">Edit</button>
          <button type="button" class="smallBtn delete" data-action="delete">Delete</button>
        </div>
      </div>

      <div class="taskMeta">
        <span class="badge">${escapeHtml(task.priority)}</span>
        <span class="badge">${escapeHtml(task.status)}</span>
      </div>
    `;

    // drag events
    div.addEventListener("dragstart", (e) => {
      draggingTaskId = task.id;
      e.dataTransfer.setData("text/plain", String(task.id));
      div.style.opacity = "0.7";
    });

    div.addEventListener("dragend", () => {
      draggingTaskId = null;
      div.style.opacity = "1";
    });

    // edit/delete button clicks
    div.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      if (action === "delete") deleteTask(task.id);
      if (action === "edit") editTask(task.id);
    });

    zones[task.status].appendChild(div);
  });

  // Counts
  const cTodo = tasks.filter(t => t.status === "todo").length;
  const cProg = tasks.filter(t => t.status === "inprogress").length;
  const cDone = tasks.filter(t => t.status === "done").length;

  document.getElementById("countTodo").textContent = String(cTodo);
  document.getElementById("countInprogress").textContent = String(cProg);
  document.getElementById("countDone").textContent = String(cDone);
}

// ---------- Drag & Drop ----------
function setupDragAndDrop() {
  document.querySelectorAll(".column").forEach(col => {
    const status = col.getAttribute("data-status");
    const zone = col.querySelector(".dropzone");

    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("over");
    });

    col.addEventListener("dragleave", () => {
      zone.classList.remove("over");
    });

    col.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("over");

      const idFromTransfer = Number(e.dataTransfer.getData("text/plain"));
      const id = idFromTransfer || draggingTaskId;
      if (!id) return;

      moveTaskToStatus(id, status);
    });
  });
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  setupDragAndDrop();
  render();

  document.getElementById("addBtn").addEventListener("click", addTask);

  document.getElementById("taskInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    const ok = confirm("Clear all tasks?");
    if (!ok) return;
    tasks = [];
    saveTasks();
    setMessage("All tasks cleared.");
    render();
  });
});
