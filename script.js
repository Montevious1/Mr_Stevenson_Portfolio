"use strict";

// ---------- Storage ----------
const STORAGE_KEY = "gradeTracker.entries.v1";

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ---------- Helpers ----------
function uid() {
  return crypto?.randomUUID?.() ?? String(Date.now()) + Math.random().toString(16).slice(2);
}

function formatDate(iso) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n < 0 || n > 100) return null;
  return n;
}

function letterGrade(avg) {
  if (avg === null) return "—";
  if (avg >= 90) return "A";
  if (avg >= 80) return "B";
  if (avg >= 70) return "C";
  if (avg >= 60) return "D";
  return "F";
}

function avgOf(list) {
  if (!list.length) return null;
  const sum = list.reduce((acc, x) => acc + x.score, 0);
  return Math.round((sum / list.length) * 10) / 10; // 1 decimal
}

// ---------- DOM ----------
const form = document.getElementById("gradeForm");
const messageEl = document.getElementById("message");

const studentNameEl = document.getElementById("studentName");
const assignmentNameEl = document.getElementById("assignmentName");
const scoreEl = document.getElementById("score");
const categoryEl = document.getElementById("category");

const resetAllBtn = document.getElementById("resetAll");

const tableBody = document.getElementById("gradeTableBody");
const totalEntriesEl = document.getElementById("totalEntries");
const classAverageEl = document.getElementById("classAverage");

const searchEl = document.getElementById("search");
const filterStudentEl = document.getElementById("filterStudent");

const selectedStudentEl = document.getElementById("selectedStudent");
const studentAverageEl = document.getElementById("studentAverage");
const studentLetterEl = document.getElementById("studentLetter");

// ---------- State ----------
let entries = loadEntries();

// ---------- Rendering ----------
function setMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.style.color = isError ? "#dc2626" : "#6b7280";
}

function uniqueStudents(list) {
  const set = new Set(list.map(e => e.student.trim()).filter(Boolean));
  return Array.from(set).sort((a,b) => a.localeCompare(b));
}

function renderStudentFilter() {
  const current = filterStudentEl.value;
  const students = uniqueStudents(entries);

  filterStudentEl.innerHTML = `<option value="">All Students</option>` +
    students.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");

  // Keep selection if possible
  if (students.includes(current)) filterStudentEl.value = current;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function filteredEntries() {
  const q = searchEl.value.trim().toLowerCase();
  const studentFilter = filterStudentEl.value.trim().toLowerCase();

  return entries.filter(e => {
    const matchesStudent = !studentFilter || e.student.toLowerCase() === studentFilter;
    const matchesQuery =
      !q ||
      e.student.toLowerCase().includes(q) ||
      e.assignment.toLowerCase().includes(q) ||
      (e.category || "").toLowerCase().includes(q);
    return matchesStudent && matchesQuery;
  });
}

function renderTable() {
  const list = filteredEntries().slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  tableBody.innerHTML = list.map(e => `
    <tr>
      <td>${escapeHtml(e.student)}</td>
      <td>${escapeHtml(e.assignment)}</td>
      <td>${escapeHtml(e.category || "")}</td>
      <td class="num">${e.score}</td>
      <td class="num">${formatDate(e.createdAt)}</td>
      <td class="num">
        <button class="actionBtn delete" data-id="${e.id}">Delete</button>
      </td>
    </tr>
  `).join("");

  totalEntriesEl.textContent = String(entries.length);

  const classAvg = avgOf(entries);
  classAverageEl.textContent = classAvg === null ? "0" : String(classAvg);

  renderStudentSummary();
}

function renderStudentSummary() {
  const selected = filterStudentEl.value.trim();

  if (!selected) {
    selectedStudentEl.textContent = "—";
    studentAverageEl.textContent = "—";
    studentLetterEl.textContent = "—";
    return;
  }

  const studentEntries = entries.filter(e => e.student === selected);
  const avg = avgOf(studentEntries);
  selectedStudentEl.textContent = selected;
  studentAverageEl.textContent = avg === null ? "—" : `${avg}%`;
  studentLetterEl.textContent = letterGrade(avg);
}

function rerenderAll() {
  renderStudentFilter();
  renderTable();
}

// ---------- Events ----------
form.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const student = studentNameEl.value.trim();
  const assignment = assignmentNameEl.value.trim();
  const score = clampScore(scoreEl.value);
  const category = categoryEl.value.trim();

  if (!student || !assignment) {
    setMessage("Please enter a student name and assignment.", true);
    return;
  }
  if (score === null) {
    setMessage("Score must be a number from 0 to 100.", true);
    return;
  }

  const entry = {
    id: uid(),
    student,
    assignment,
    category: category || "",
    score,
    createdAt: new Date().toISOString()
  };

  entries.push(entry);
  saveEntries(entries);

  form.reset();
  studentNameEl.focus();
  setMessage("Grade added and saved.");

  rerenderAll();
});

tableBody.addEventListener("click", (evt) => {
  const btn = evt.target.closest("button[data-id]");
  if (!btn) return;

  const id = btn.getAttribute("data-id");
  if (!id) return;

  const ok = confirm("Delete this entry?");
  if (!ok) return;

  entries = entries.filter(e => e.id !== id);
  saveEntries(entries);
  setMessage("Entry deleted.");
  rerenderAll();
});

resetAllBtn.addEventListener("click", () => {
  const ok = confirm("This will delete ALL saved grades. Continue?");
  if (!ok) return;

  entries = [];
  saveEntries(entries);
  filterStudentEl.value = "";
  searchEl.value = "";
  setMessage("All data cleared.");
  rerenderAll();
});

searchEl.addEventListener("input", () => renderTable());
filterStudentEl.addEventListener("change", () => renderTable());

// ---------- Init ----------
rerenderAll();