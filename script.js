let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

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
    status: "todo",
    priority: priority
  };

  tasks.push(task);
  saveTasks();
  input.value = "";
  renderTasks();
}

function moveTask(id) {
  let task = tasks.find(t => t.id === id);

  if (task.status === "todo") task.status = "inprogress";
  else if (task.status === "inprogress") task.status = "done";
  else task.status = "todo";

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
    div.innerText = task.text + " (" + task.priority + ")";
    div.onclick = () => moveTask(task.id);

    document.getElementById(task.status).appendChild(div);
  });
}

renderTasks();