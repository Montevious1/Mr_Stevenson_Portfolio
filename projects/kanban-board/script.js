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

renderTasks();
