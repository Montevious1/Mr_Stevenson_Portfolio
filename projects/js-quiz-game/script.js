"use strict";

const BEST_KEY = "jsQuiz.bestScore.v1";

const questions = [
  {
    q: "Which keyword declares a block-scoped variable in JavaScript?",
    choices: ["var", "let", "const", "static"],
    answer: "let"
  },
  {
    q: "What does DOM stand for?",
    choices: ["Data Object Model", "Document Object Model", "Dynamic Output Method", "Document Oriented Map"],
    answer: "Document Object Model"
  },
  {
    q: "Which method converts a JSON string into an object?",
    choices: ["JSON.toObject()", "JSON.parse()", "JSON.stringify()", "parse.JSON()"],
    answer: "JSON.parse()"
  },
  {
    q: "What will `typeof []` return?",
    choices: ["array", "object", "list", "undefined"],
    answer: "object"
  },
  {
    q: "Which event fires when a button is clicked?",
    choices: ["submit", "change", "click", "keydown"],
    answer: "click"
  },
  {
    q: "What does `e.preventDefault()` do in a form submit handler?",
    choices: ["Stops the page from refreshing/submitting", "Deletes the form", "Clears LocalStorage", "Creates a new event"],
    answer: "Stops the page from refreshing/submitting"
  },
  {
    q: "Which loop is best for repeating code a known number of times?",
    choices: ["for", "while", "do...while", "switch"],
    answer: "for"
  },
  {
    q: "Which line correctly selects an element by id?",
    choices: ["document.getElementByClass('x')", "document.querySelectorAll('#x')", "document.getElementById('x')", "document.selectId('x')"],
    answer: "document.getElementById('x')"
  }
];

let shuffled = [];
let index = 0;
let score = 0;
let timeLeft = 60;
let timerId = null;
let locked = false;

const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("bestScore");
const qEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

function loadBest() {
  const raw = localStorage.getItem(BEST_KEY);
  const best = raw ? Number(raw) : 0;
  bestEl.textContent = String(Number.isFinite(best) ? best : 0);
}

function saveBestIfNeeded() {
  const currentBest = Number(bestEl.textContent) || 0;
  if (score > currentBest) {
    localStorage.setItem(BEST_KEY, String(score));
    bestEl.textContent = String(score);
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function resetState() {
  shuffled = shuffle(questions);
  index = 0;
  score = 0;
  timeLeft = 60;
  locked = false;
  scoreEl.textContent = "0";
  timeEl.textContent = "60";
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  choicesEl.innerHTML = "";
  qEl.textContent = "Press Start to begin";
}

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft -= 1;
    timeEl.textContent = String(timeLeft);

    if (timeLeft <= 0) {
      endQuiz();
    }
  }, 1000);
}

function showQuestion() {
  if (index >= shuffled.length) {
    endQuiz();
    return;
  }

  locked = false;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";

  const item = shuffled[index];
  qEl.textContent = item.q;

  choicesEl.innerHTML = "";
  item.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choiceBtn";
    btn.type = "button";
    btn.textContent = choice;
    btn.addEventListener("click", () => selectAnswer(choice));
    choicesEl.appendChild(btn);
  });
}

function selectAnswer(choice) {
  if (locked) return;
  locked = true;

  const item = shuffled[index];
  const correct = choice === item.answer;

  if (correct) {
    score += 10;
    scoreEl.textContent = String(score);
    feedbackEl.textContent = "Correct!";
    feedbackEl.className = "feedback good";
  } else {
    timeLeft = Math.max(0, timeLeft - 5);
    timeEl.textContent = String(timeLeft);
    feedbackEl.textContent = `Incorrect. Correct answer: ${item.answer}`;
    feedbackEl.className = "feedback bad";
  }

  index += 1;

  setTimeout(() => {
    showQuestion();
  }, 700);
}

function endQuiz() {
  clearInterval(timerId);
  timerId = null;
  choicesEl.innerHTML = "";
  qEl.textContent = `Quiz Complete! Final Score: ${score}`;
  feedbackEl.textContent = "Tip: Use this as an IBC practice tool and track improvement over time.";
  feedbackEl.className = "feedback";
  saveBestIfNeeded();
}

startBtn.addEventListener("click", () => {
  resetState();
  startTimer();
  showQuestion();
});

restartBtn.addEventListener("click", () => {
  resetState();
  if (timerId) {
    startTimer();
    showQuestion();
  }
});

loadBest();
resetState();
