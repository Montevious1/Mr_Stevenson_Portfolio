let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  let input = document.getElementById("taskInput");
  let priority = document.getElementById("priority").value;

  if (input.value === "") return;

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let draggingTaskId = null;

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  let input = document.getElementById("taskInput");
  let priority = document.getElementById("priority").value;

  if (input.value === "") return;

  let task = {
    id: Date.now(),
    text: input.value,
    priority: priority,
    status: "todo"
  };

  tasks.push(task);
  saveTasks();
  input.value = "";
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function editTask(id) {
  let task = tasks.find(t => t.id === id);
  let newText = prompt("Edit task:", task.text);

  if (newText !== null && newText.trim() !== "") {
    task.text = newText;
    saveTasks();
    renderTasks();
  }
}

function moveTask(id, status) {
  let task = tasks.find(t => t.id === id);
  task.status = status;
  saveTasks();
  renderTasks();
}

function renderTasks() {

  document.getElementById("todo").innerHTML = "";
  document.getElementById("inprogress").innerHTML = "";
  document.getElementById("done").innerHTML = "";

  tasks.forEach(task => {

    let div = document.createElement("div");
    div.className = "task";
    div.draggable = true;

    div.innerHTML = `
      <strong>${task.text}</strong>
      <br>
      ${task.priority}
      <br>
      <button onclick="editTask(${task.id})">Edit</button>
      <button onclick="deleteTask(${task.id})">Delete</button>
    `;

    div.addEventListener("dragstart", () => {
      draggingTaskId = task.id;
    });

    document.getElementById(task.status).appendChild(div);

  });
}

document.querySelectorAll(".dropzone").forEach(zone => {

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  zone.addEventListener("drop", () => {
    if (draggingTaskId) {
      moveTask(draggingTaskId, zone.id);
    }
  });

});

renderTasks();
}


