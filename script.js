let DATA_CONFIG = {};
let currentIndex = 1;
let activeAnswers = [];
let correctCount = 0;
let gameRunning = false;

// Elementen
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");
const gameOver = document.getElementById("gameOver");
const questionBox = document.getElementById("question");

// Vaste X-posities voor A/B/C zodat bubbels niet overlappen
const BUBBLE_X_POSITIONS = [150, 350, 550]; // je kunt dit aanpassen aan je scherm

// Vragen laden
async function loadQuestions() {
  try {
    const res = await fetch("questions.json");
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

    startBtn.disabled = false;
  } catch (err) {
    console.error("Kan questions.json niet laden", err);
    alert("Vragen konden niet geladen worden!");
  }
}

// Startknop
startBtn.addEventListener("click", () => {
  if (!DATA_CONFIG[currentIndex]) return;

  startScreen.style.display = "none";
  gameRunning = true;
  showQuestion();
  spawnAnswers();
});

// Vraag + antwoorden tonen
function showQuestion() {
  const data = DATA_CONFIG[currentIndex];

  questionBox.innerHTML = `
    <strong>Vraag:</strong> ${data.vraag}<br><br>
    <div class="answers-list">
      <strong>A.</strong> ${data.answers.A}<br>
      <strong>B.</strong> ${data.answers.B}<br>
      <strong>C.</strong> ${data.answers.C}
    </div>
  `;
  questionBox.style.display = "block";
}

// ABC bubbels spawnen (zonder tekst)
function spawnAnswers() {
  if (!gameRunning || !DATA_CONFIG[currentIndex]) return;

  activeAnswers = [];
  const letters = ["A", "B", "C"];
  letters.forEach((letter, index) => spawnItem(letter, index));
}

// Bubble
function spawnItem(letter, index) {
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
    vy: -(0.6 + Math.random() * 0.4),
    removed: false
  };

  activeAnswers.push(item);

  div.addEventListener("click", () => handleClick(item));

  function move() {
    if (!gameRunning || item.removed) return;
    item.y += item.vy;
    div.style.top = item.y + "px";

    if (item.y < -200) {
      // Als één bubbel uit beeld gaat, verwijder ze allemaal en ga naar volgende vraag
      removeAnswers();
      nextQuestion();
    } else {
      requestAnimationFrame(move);
    }
  }
  move();
}

// Klik op bubbel
function handleClick(item) {
  if (item.removed) return;
  item.removed = true;

  const data = DATA_CONFIG[currentIndex];
  const isCorrect = item.letter === data.correct;

  if (isCorrect) correctCount++;

  questionBox.innerHTML = `
    <strong>Vraag:</strong> ${data.vraag}<br><br>
    <strong>Jouw antwoord:</strong> ${item.letter} – ${data.answers[item.letter]}<br><br>
    <strong>Uitleg:</strong> ${data.toelichting}
  `;

  // Gebruik nu de tijd van de vraag
  setTimeout(() => {
    removeAnswers();
    nextQuestion();
  }, data.tijd);
}

// Antwoorden verwijderen
function removeAnswers() {
  activeAnswers.forEach(i => i.el.remove());
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

// Game over
function endGame() {
  gameRunning = false;
  gameOver.style.display = "flex";
  gameOver.innerHTML = `
    <div class="gameover-box">
      <div class="final-score">${correctCount}</div>
      <div class="final-score-value">punten</div>
      <button onclick="location.reload()">Opnieuw</button>
    </div>
  `;
}

window.addEventListener("load", loadQuestions);
