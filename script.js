// Game State
let DATA_CONFIG = {}; // alle ingeladen vragen, keyed by index
let currentIndex = 1; // huidige vraag index, start bij 1
let activeAnswers = []; // array met actieve antwoord bubbels
let correctCount = 0; // aantal correcte antwoorden
let totalQuestions = 0; // totaal aantal vragen
let gameRunning = false; // Game-loop actief
let gameStats = {
  lastScore: 0,
  highScore: 0,
  gamesPlayed: 0,
  totalScore: 0
};

// Elementen
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");
const gameArea = document.querySelector(".game-container");
const gameOver = document.getElementById("gameOver");
const questionBox = document.getElementById("question");
const currentScoreEl = document.getElementById("currentScore");
const questionNumberEl = document.getElementById("questionNumber");
const totalQuestionsEl = document.getElementById("totalQuestions");

// Vaste X-posities voor A/B/C zodat bubbels niet overlappen
const BUBBLE_X_POSITIONS = [150, 350, 550];

// Local Storage keys
const STORAGE_KEY = "dataslice_stats";

// ===== INITIALIZATION =====

// Laad statistieken bij opstarten
function loadStats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      gameStats = JSON.parse(saved);
      updateStatsDisplay();
    }
  } catch (err) {
    console.error("Kon statistieken niet laden", err);
  }
}

// Update statistieken display op startscherm
function updateStatsDisplay() {
  document.getElementById("lastScore").textContent = gameStats.lastScore || "--";
  document.getElementById("highScore").textContent = gameStats.highScore || "--";
  document.getElementById("gamesPlayed").textContent = gameStats.gamesPlayed || 0;
  
  const avg = gameStats.gamesPlayed > 0 
    ? Math.round(gameStats.totalScore / gameStats.gamesPlayed) 
    : "--";
  document.getElementById("averageScore").textContent = avg;
}

// Sla statistieken op
function saveStats() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameStats));
  } catch (err) {
    console.error("Kon statistieken niet opslaan", err);
  }
}

// ===== VRAGEN LADEN =====

async function loadQuestions() {
  try {
    const res = await fetch("questions.json");
    if (!res.ok) throw new Error("HTTP error " + res.status);
    
    const data = await res.json();

    let nummer = 1;
    data.antwoordmodelAlgemeneRondes.forEach(ronde => {
      ronde.vragen.forEach(vraag => {
        DATA_CONFIG[nummer] = {
          vraag: vraag.vraag,
          answers: vraag.answers,
          correct: vraag.correct,
          toelichting: vraag.toelichting,
          punten: vraag.punten || 1,
          tijd: vraag.tijd || 3000 // fallback tijd
        };
        nummer++;
      });
    });

    totalQuestions = Object.keys(DATA_CONFIG).length;
    totalQuestionsEl.textContent = totalQuestions;

    startBtn.disabled = false;
    startBtn.querySelector(".btn-text").textContent = "Start Spel";
    
    const loadingStatus = document.getElementById("loadingStatus");
    loadingStatus.textContent = `${totalQuestions} vragen geladen!`;
    loadingStatus.style.color = "#36773f";

  } catch (err) {
    console.error("Kan questions.json niet laden", err);
    const loadingStatus = document.getElementById("loadingStatus");
    loadingStatus.textContent = "❌ Fout bij laden van vragen";
    loadingStatus.style.color = "#dc2626";
    startBtn.querySelector(".btn-text").textContent = "Fout - Probeer opnieuw";
  }
}

// ===== GAME FLOW =====

// Startknop
startBtn.addEventListener("click", () => {
  if (!DATA_CONFIG[currentIndex]) return;

  startScreen.classList.remove("active");
  setTimeout(() => {
    startScreen.style.display = "none";
    gameArea.style.display = "block";
  }, 300);

  gameRunning = true;
  correctCount = 0;
  currentIndex = 1;
  updateScoreDisplay();
  
  showQuestion();
  spawnAnswers();
});

// Update score display
function updateScoreDisplay() {
  currentScoreEl.textContent = correctCount;
  questionNumberEl.textContent = currentIndex;
}

// Vraag + antwoorden tonen
function showQuestion() {
  const data = DATA_CONFIG[currentIndex];
  
  updateScoreDisplay();

  questionBox.innerHTML = `
    <div class="question-content">
      <p class="question-label">Vraag ${currentIndex}:</p>
      <p class="question-text">${data.vraag}</p>
      <div class="answers-list">
        <div class="answer-item"><strong>A.</strong> ${data.answers.A}</div>
        <div class="answer-item"><strong>B.</strong> ${data.answers.B}</div>
        <div class="answer-item"><strong>C.</strong> ${data.answers.C}</div>
      </div>
    </div>
  `;
}

// ABC bubbels spawnen
function spawnAnswers() {
  if (!gameRunning || !DATA_CONFIG[currentIndex]) return;

  // Clear any existing bubbles
  activeAnswers.forEach(item => {
    if (item.el && item.el.parentNode) {
      item.el.remove();
    }
  });
  activeAnswers = [];

  const letters = ["A", "B", "C"];
  letters.forEach((letter, index) => {
    setTimeout(() => spawnItem(letter, index), index * 200); // Stagger spawn
  });
}

// Bubble spawnen
function spawnItem(letter, index) {
  if (!gameRunning) return;

  const div = document.createElement("div");
  div.className = "item";
  div.textContent = letter;
  div.style.position = "absolute";

  // Gebruik vaste X-positie zodat bubbels niet overlappen
  const x = BUBBLE_X_POSITIONS[index % BUBBLE_X_POSITIONS.length];
  const y = window.innerHeight + 150;

  div.style.left = x + "px";
  div.style.top = y + "px";

  document.body.appendChild(div);

  const item = {
    el: div,
    letter,
    y,
    vy: -(0.6 + Math.random() * 0.4), // Snelheid variatie
    removed: false
  };

  activeAnswers.push(item);

  div.addEventListener("click", () => handleClick(item));

  function move() {
    if (!gameRunning || item.removed) return;
    
    item.y += item.vy;
    div.style.top = item.y + "px";

    // Als bubbel uit beeld gaat
    if (item.y < -200) {
      if (!item.removed) {
        item.removed = true;
        // Markeer als gemist
        showMissedFeedback();
      }
    } else {
      requestAnimationFrame(move);
    }
  }
  move();
}

// Als alle bubbels gemist zijn
function showMissedFeedback() {
  const data = DATA_CONFIG[currentIndex];
  
  questionBox.innerHTML = `
    <div class="feedback missed">
      <p class="feedback-status">⏱️ Te laat!</p>
      <p class="question-text">${data.vraag}</p>
      <p class="feedback-answer">
        <strong>Juiste antwoord:</strong> ${data.correct} – ${data.answers[data.correct]}
      </p>
      <p class="feedback-explanation">${data.toelichting}</p>
    </div>
  `;

  setTimeout(() => {
    removeAnswers();
    nextQuestion();
  }, 3000);
}

// Klik op bubbel
function handleClick(item) {
  if (item.removed || !gameRunning) return;
  item.removed = true;

  const data = DATA_CONFIG[currentIndex];
  const isCorrect = item.letter === data.correct;

  // Update score
  if (isCorrect) {
    correctCount += data.punten;
    updateScoreDisplay();
  }

  // Visual feedback
  item.el.classList.add(isCorrect ? "correct" : "incorrect");

  // Show feedback
  questionBox.innerHTML = `
    <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
      <p class="feedback-status">${isCorrect ? '✓ Correct!' : '✗ Fout'}</p>
      <p class="question-text">${data.vraag}</p>
      <p class="feedback-answer">
        <strong>Jouw antwoord:</strong> ${item.letter} – ${data.answers[item.letter]}
      </p>
      ${!isCorrect ? `<p class="feedback-correct"><strong>Juiste antwoord:</strong> ${data.correct} – ${data.answers[data.correct]}</p>` : ''}
      <p class="feedback-explanation">${data.toelichting}</p>
    </div>
  `;

  // Mark other bubbles as removed to stop checking
  activeAnswers.forEach(i => {
    if (i !== item) i.removed = true;
  });

  // Gebruik de tijd van de vraag
  setTimeout(() => {
    removeAnswers();
    nextQuestion();
  }, data.tijd);
}

// Antwoorden verwijderen
function removeAnswers() {
  activeAnswers.forEach(item => {
    if (item.el && item.el.parentNode) {
      item.el.remove();
    }
  });
  activeAnswers = [];
}

// Volgende vraag
function nextQuestion() {
  currentIndex++;
  
  if (!DATA_CONFIG[currentIndex]) {
    endGame();
  } else {
    showQuestion();
    spawnAnswers();
  }
}

// ===== GAME OVER =====

function endGame() {
  gameRunning = false;
  removeAnswers();
  
  // Update stats
  gameStats.lastScore = correctCount;
  gameStats.gamesPlayed++;
  gameStats.totalScore += correctCount;
  
  if (correctCount > gameStats.highScore) {
    gameStats.highScore = correctCount;
  }
  
  saveStats();

  // Show game over screen
  gameArea.style.display = "none";
  
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  let resultMessage = "Spel Afgelopen!";
  
  if (percentage === 100) {
    resultMessage = "🏆 Perfect Score!";
  } else if (percentage >= 80) {
    resultMessage = "🌟 Uitstekend!";
  } else if (percentage >= 60) {
    resultMessage = "👍 Goed gedaan!";
  } else if (percentage >= 40) {
    resultMessage = "💪 Blijf oefenen!";
  }

  document.getElementById("resultTitle").textContent = resultMessage;
  document.getElementById("resultScore").textContent = correctCount;
  
  const incorrectList = document.getElementById("incorrectList");
  incorrectList.innerHTML = `
    <p class="result-stats">
      ${correctCount} van ${totalQuestions} correct (${percentage}%)
    </p>
  `;

  gameOver.style.display = "flex";
  setTimeout(() => {
    gameOver.classList.add("active");
  }, 10);
}

// ===== HOME BUTTON HANDLERS =====

document.getElementById("startHomeBtn").addEventListener("click", () => {
  window.location.href = "/"; // Of jouw home URL
});

document.getElementById("gameOverHomeBtn").addEventListener("click", () => {
  window.location.href = "/"; // Of jouw home URL
});

// ===== INITIALIZATION =====

window.addEventListener("load", () => {
  loadStats();
  loadQuestions();
});