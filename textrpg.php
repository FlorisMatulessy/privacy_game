<?php
session_start();

// Database configuratie
$host = 'localhost';
$dbname = 'privacy_game';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Database connectie mislukt: " . $e->getMessage());
}

// Check of gebruiker ingelogd is
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

$user_id = $_SESSION['user_id'];

// Haal gebruikersgegevens op
$stmt = $pdo->prepare("SELECT username FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// AJAX Handler
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    
    if ($_POST['action'] === 'start_game') {
        // Start nieuwe game sessie
        $stmt = $pdo->prepare("INSERT INTO game_sessions (user_id) VALUES (?)");
        $stmt->execute([$user_id]);
        $session_id = $pdo->lastInsertId();
        
        $_SESSION['game_session_id'] = $session_id;
        
        echo json_encode(['success' => true, 'session_id' => $session_id]);
        exit();
    }
    
    if ($_POST['action'] === 'submit_answer') {
        $session_id = $_SESSION['game_session_id'] ?? null;
        $scenario_id = $_POST['scenario_id'] ?? null;
        $answer = $_POST['answer'] ?? null;
        
        if (!$session_id || !$scenario_id || !$answer) {
            echo json_encode(['success' => false, 'error' => 'Missing parameters']);
            exit();
        }
        
        // Haal scenario op
        $stmt = $pdo->prepare("SELECT * FROM scenarios WHERE id = ?");
        $stmt->execute([$scenario_id]);
        $scenario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $is_correct = ($answer === $scenario['correct_answer']);
        $points = $is_correct ? $scenario['points'] : 0;
        
        // Sla antwoord op
        $stmt = $pdo->prepare("INSERT INTO user_answers (session_id, scenario_id, chosen_answer, is_correct) VALUES (?, ?, ?, ?)");
        $stmt->execute([$session_id, $scenario_id, $answer, $is_correct ? 1 : 0]);
        
        // Update sessie
        if ($is_correct) {
            $stmt = $pdo->prepare("UPDATE game_sessions SET total_score = total_score + ?, correct_count = correct_count + 1 WHERE id = ?");
            $stmt->execute([$points, $session_id]);
        } else {
            $stmt = $pdo->prepare("UPDATE game_sessions SET wrong_count = wrong_count + 1 WHERE id = ?");
            $stmt->execute([$session_id]);
        }
        
        echo json_encode(['success' => true, 'is_correct' => $is_correct, 'points' => $points]);
        exit();
    }
    
    if ($_POST['action'] === 'complete_game') {
        $session_id = $_SESSION['game_session_id'] ?? null;
        
        if ($session_id) {
            $stmt = $pdo->prepare("UPDATE game_sessions SET completed = 1, completed_at = NOW() WHERE id = ?");
            $stmt->execute([$session_id]);
            
            // Haal finale score op
            $stmt = $pdo->prepare("SELECT total_score, correct_count, wrong_count FROM game_sessions WHERE id = ?");
            $stmt->execute([$session_id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'score' => $result]);
        } else {
            echo json_encode(['success' => false]);
        }
        exit();
    }
    
    if ($_POST['action'] === 'get_leaderboard') {
        // Haal top 10 op
        $stmt = $pdo->query("
            SELECT u.username, gs.total_score, gs.completed_at
            FROM game_sessions gs
            JOIN users u ON gs.user_id = u.id
            WHERE gs.completed = 1
            ORDER BY gs.total_score DESC, gs.completed_at ASC
            LIMIT 10
        ");
        $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Haal rank van huidige gebruiker op
        $stmt = $pdo->prepare("
            SELECT COUNT(*) + 1 as rank
            FROM game_sessions
            WHERE completed = 1 AND total_score > (
                SELECT COALESCE(MAX(total_score), 0)
                FROM game_sessions
                WHERE user_id = ? AND completed = 1
            )
        ");
        $stmt->execute([$user_id]);
        $rank_result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'leaderboard' => $leaderboard,
            'user_rank' => $rank_result['rank']
        ]);
        exit();
    }
    
    if ($_POST['action'] === 'get_statistics') {
        $stats = [];
        
        for ($i = 1; $i <= 6; $i++) {
            $stmt = $pdo->prepare("
                SELECT 
                    chosen_answer,
                    COUNT(*) as count
                FROM user_answers
                WHERE scenario_id = ?
                GROUP BY chosen_answer
            ");
            $stmt->execute([$i]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $total = array_sum(array_column($results, 'count'));
            $percentages = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0];
            
            foreach ($results as $row) {
                $percentages[$row['chosen_answer']] = $total > 0 ? round(($row['count'] / $total) * 100) : 0;
            }
            
            $stats[$i] = $percentages;
        }
        
        echo json_encode(['success' => true, 'statistics' => $stats]);
        exit();
    }
}

// Haal alle scenario's op
$scenarios_stmt = $pdo->query("SELECT * FROM scenarios ORDER BY scenario_number");
$scenarios_data = $scenarios_stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Datalek Preventie Spel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-gray-100 min-h-screen">
    
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <a href="index.html" id="nav-left-btn" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm">
                ← Terug naar home
            </a>
            <a href="account.php" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold text-sm">
                👤 Account
            </a>
        </div>
    </nav>
    
    <!-- Start Scherm -->
    <div id="start-screen" class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-gray-800 mb-4">🔒 Datalek Preventie Spel</h1>
                <p class="text-xl text-gray-600">Bescherm de gemeente tegen datalekken!</p>
                <p class="text-sm text-gray-500 mt-2">Welkom, <strong><?php echo htmlspecialchars($user['username']); ?></strong>!</p>
            </div>

            <div class="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">Welkom bij de Gemeente!</h2>
                <p class="text-gray-700 mb-4 leading-relaxed">
                    Je werkt bij de gemeente en bent verantwoordelijk voor het beschermen van gevoelige informatie. Elke dag kom je situaties tegen waarbij je snel de juiste beslissing moet nemen.
                </p>
                <p class="text-gray-700 mb-4 leading-relaxed">
                    In dit spel krijg je <strong>6 realistische scenario's</strong> voorgelegd die je in het dagelijks werk kunt tegenkomen. Bij elk scenario heb je <strong>4 antwoordopties</strong> om uit te kiezen.
                </p>
                <p class="text-gray-700 leading-relaxed">
                    <strong>Let op:</strong> Slechts één antwoord is volledig correct! Kies je fout, dan zie je een grappig verhaal over wat er misgaat én krijg je uitleg waarom het fout is. Zo leer je van je fouten!
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-4 mb-8">
                <div class="bg-gray-50 p-6 rounded-lg text-center border-2 border-gray-200">
                    <div class="text-4xl mb-3">📋</div>
                    <h3 class="font-bold text-gray-800 mb-2">6 Scenario's</h3>
                    <p class="text-sm text-gray-600">Verschillende situaties uit het dagelijks werk</p>
                </div>
                <div class="bg-gray-50 p-6 rounded-lg text-center border-2 border-gray-200">
                    <div class="text-4xl mb-3">🎯</div>
                    <h3 class="font-bold text-gray-800 mb-2">4 Keuzes</h3>
                    <p class="text-sm text-gray-600">Per scenario kun je uit 4 antwoorden kiezen</p>
                </div>
                <div class="bg-gray-50 p-6 rounded-lg text-center border-2 border-gray-200">
                    <div class="text-4xl mb-3">📚</div>
                    <h3 class="font-bold text-gray-800 mb-2">Leer & Win</h3>
                    <p class="text-sm text-gray-600">Krijg feedback en vergelijk je score met collega's</p>
                </div>
            </div>

            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
                <p class="text-sm text-gray-700">
                    <strong>💡 Tip:</strong> Dit is geen test! Het doel is om te leren over databeveiliging op een leuke manier. Maak je geen zorgen als je fouten maakt - dat is juist de bedoeling!
                </p>
            </div>

            <button onclick="startGame()" class="w-full bg-blue-500 text-white py-4 px-8 rounded-lg hover:bg-blue-600 transition-colors font-bold text-xl shadow-lg">
                🚀 Start het spel
            </button>
        </div>
    </div>

    <!-- Scenario Scherm -->
    <div id="scenario-screen" class="container mx-auto px-4 py-8 max-w-4xl hidden">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="mb-6">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Voortgang</span>
                    <span id="progress-text">Scenario 1 van 6</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div id="progress-bar" class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 16.67%"></div>
                </div>
            </div>

            <div class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
                <h2 id="scenario-title" class="text-xl font-bold text-gray-800 mb-3"></h2>
                <p id="scenario-text" class="text-gray-700 leading-relaxed"></p>
            </div>

            <div class="space-y-3" id="answer-options">
                <button onclick="selectAnswer('A')" class="answer-btn w-full text-left p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-all">
                    <span class="font-bold text-blue-600">A.</span> <span id="option-a"></span>
                </button>
                <button onclick="selectAnswer('B')" class="answer-btn w-full text-left p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-all">
                    <span class="font-bold text-blue-600">B.</span> <span id="option-b"></span>
                </button>
                <button onclick="selectAnswer('C')" class="answer-btn w-full text-left p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-all">
                    <span class="font-bold text-blue-600">C.</span> <span id="option-c"></span>
                </button>
                <button onclick="selectAnswer('D')" class="answer-btn w-full text-left p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-all">
                    <span class="font-bold text-blue-600">D.</span> <span id="option-d"></span>
                </button>
            </div>
        </div>
    </div>

    <!-- Feedback Scherm -->
    <div id="feedback-screen" class="container mx-auto px-4 py-8 max-w-4xl hidden">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div id="feedback-box" class="border-3 border-red-500 bg-red-50 rounded-lg p-6">
                <div class="text-center text-6xl mb-4" id="feedback-icon">❌</div>
                <h2 class="text-2xl font-bold text-center text-gray-800 mb-4" id="feedback-title"></h2>
                
                <p class="text-gray-700 mb-4">
                    Je hebt gekozen voor: <strong id="chosen-answer"></strong>
                </p>
                
                <div id="story-section" class="bg-white border-l-4 border-red-500 p-4 mb-4 rounded">
                    <p class="font-bold text-gray-800 mb-2">Wat er gebeurde:</p>
                    <p class="text-gray-700" id="story-result"></p>
                </div>

                <div id="explanation-section" class="bg-white border-l-4 border-blue-500 p-4 rounded">
                    <p class="font-bold text-gray-800 mb-2">💡 Waarom is dit fout?</p>
                    <p class="text-gray-700 mb-3" id="explanation"></p>
                    <p class="font-bold text-gray-800 mb-2">✅ Wat had beter gekund?</p>
                    <p class="text-gray-700" id="correct-answer-text"></p>
                </div>

                <button onclick="nextScenario()" class="w-full mt-6 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                    Volgende scenario
                </button>
            </div>
        </div>
    </div>

    <!-- Score Scherm -->
    <div id="score-screen" class="container mx-auto px-4 py-8 max-w-4xl hidden">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="text-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                <h2 class="text-3xl font-bold text-gray-800 mb-2">🎉 Spel voltooid!</h2>
                <p class="text-gray-600 mb-6">Goed gedaan! Hier is je score:</p>
                
                <div id="final-score" class="text-7xl font-bold text-green-500 my-8">0/100</div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                        <div id="correct-count" class="text-3xl font-bold text-green-500">0</div>
                        <div class="text-sm text-gray-600">Correct</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                        <div id="wrong-count" class="text-3xl font-bold text-red-500">0</div>
                        <div class="text-sm text-gray-600">Fout</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                        <div id="badges" class="text-2xl font-bold text-yellow-500">⭐</div>
                        <div class="text-sm text-gray-600">Badges</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                        <div id="rank" class="text-3xl font-bold text-blue-500">#?</div>
                        <div class="text-sm text-gray-600">Jouw positie</div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                    <button onclick="showLeaderboard()" class="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                        Bekijk ranglijst
                    </button>
                    <button onclick="location.reload()" class="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-semibold">
                        Speel opnieuw
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Ranglijst Scherm -->
    <div id="leaderboard-screen" class="container mx-auto px-4 py-8 max-w-6xl hidden">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Ranglijst & Statistieken</h2>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div class="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <div class="bg-gray-800 text-white p-4 text-center font-bold">
                        🏆 Top Spelers
                    </div>
                    <div id="leaderboard-content"></div>
                </div>

                <div>
                    <h3 class="font-bold text-gray-800 mb-4 text-lg">Populaire keuzes per scenario</h3>
                    <div id="stats-container" class="space-y-4 max-h-96 overflow-y-auto"></div>
                </div>
            </div>

            <button onclick="location.reload()" class="w-full mt-6 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                Speel opnieuw
            </button>
        </div>
    </div>

    <!-- Audio elements -->
    <audio id="menu-music" loop>
        <source src="mp3/menu.mp3" type="audio/mpeg">
    </audio>
    <audio id="game-music" loop>
        <source src="mp3/game.mp3" type="audio/mpeg">
    </audio>

    <!-- Audio Controls Footer -->
    <footer class="fixed bottom-0 left-0 right-0 bg-gray-800 text-white shadow-lg z-50">
        <div class="container mx-auto px-4 py-3">
            <div class="flex items-center justify-center gap-6 flex-wrap">
                <button onclick="toggleSound()" class="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
                    <span id="sound-icon">🔊</span>
                    <span>Muziek: <span id="sound-status" class="font-semibold">Aan</span></span>
                </button>
                
                <div class="flex items-center gap-3">
                    <span class="text-sm">🔉</span>
                    <input 
                        type="range" 
                        id="volume-slider" 
                        min="0" 
                        max="100" 
                        value="50" 
                        class="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                        onchange="changeVolume(this.value)"
                    >
                    <span class="text-sm">🔊</span>
                    <span id="volume-percentage" class="text-sm font-semibold w-10">50%</span>
                </div>
            </div>
        </div>
    </footer>

    <script>
    // Scenario data from PHP
    const scenarios = <?php echo json_encode($scenarios_data); ?>;
    
    let currentScenario = 0;
    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let userAnswers = [];
    let soundEnabled = true;
    let menuMusic, gameMusic;
    let sessionId = null;

    window.addEventListener('DOMContentLoaded', function() {
        menuMusic = document.getElementById('menu-music');
        gameMusic = document.getElementById('game-music');
        
        const initialVolume = 0.5;
        if (menuMusic) menuMusic.volume = initialVolume;
        if (gameMusic) gameMusic.volume = initialVolume;
        
        if (soundEnabled) {
            playMenuMusic();
        }
    });

    function playMenuMusic() {
        if (gameMusic) gameMusic.pause();
        if (menuMusic && soundEnabled) {
            menuMusic.play().catch(e => console.log('Audio play prevented:', e));
        }
    }

    function playGameMusic() {
        if (menuMusic) menuMusic.pause();
        if (gameMusic && soundEnabled) {
            gameMusic.play().catch(e => console.log('Audio play prevented:', e));
        }
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
        document.getElementById('sound-status').textContent = soundEnabled ? 'Aan' : 'Uit';
        document.getElementById('sound-icon').textContent = soundEnabled ? '🔊' : '🔇';
        
        if (soundEnabled) {
            if (document.getElementById('start-screen').classList.contains('hidden')) {
                playGameMusic();
            } else {
                playMenuMusic();
            }
        } else {
            if (menuMusic) menuMusic.pause();
            if (gameMusic) gameMusic.pause();
        }
    }

    function changeVolume(value) {
        const volume = value / 100;
        if (menuMusic) menuMusic.volume = volume;
        if (gameMusic) gameMusic.volume = volume;
        document.getElementById('volume-percentage').textContent = value + '%';
    }

    async function startGame() {
        // Start nieuwe game sessie via AJAX
        const response = await fetch('textrpg.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'action=start_game'
        });
        const data = await response.json();
        
        if (data.success) {
            sessionId = data.session_id;
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('scenario-screen').classList.remove('hidden');
            updateNavButton('menu');
            playGameMusic();
            loadScenario(0);
        }
    }

    function updateNavButton(type) {
        const navBtn = document.getElementById('nav-left-btn');
        if (type === 'menu') {
            navBtn.textContent = '← Terug naar menu';
            navBtn.href = '#';
            navBtn.onclick = function(e) {
                e.preventDefault();
                backToMenu();
            };
        } else {
            navBtn.textContent = '← Terug naar home';
            navBtn.href = 'index.html';
            navBtn.onclick = null;
        }
    }

    function backToMenu() {
        currentScenario = 0;
        score = 0;
        correctAnswers = 0;
        wrongAnswers = 0;
        userAnswers = [];
        sessionId = null;
        
        document.getElementById('scenario-screen').classList.add('hidden');
        document.getElementById('feedback-screen').classList.add('hidden');
        document.getElementById('score-screen').classList.add('hidden');
        document.getElementById('leaderboard-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        
        updateNavButton('home');
        playMenuMusic();
    }

    function loadScenario(index) {
        const scenario = scenarios[index];
        
        document.getElementById('progress-text').textContent = `Scenario ${index + 1} van ${scenarios.length}`;
        document.getElementById('progress-bar').style.width = `${((index + 1) / scenarios.length) * 100}%`;
        
        document.getElementById('scenario-title').textContent = scenario.title;
        document.getElementById('scenario-text').textContent = scenario.text;
        
        document.getElementById('option-a').textContent = scenario.option_a;
        document.getElementById('option-b').textContent = scenario.option_b;
        document.getElementById('option-c').textContent = scenario.option_c;
        document.getElementById('option-d').textContent = scenario.option_d;
    }

    async function selectAnswer(answer) {
        const scenario = scenarios[currentScenario];
        
        // Submit answer via AJAX
        const response = await fetch('textrpg.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `action=submit_answer&scenario_id=${scenario.id}&answer=${answer}`
        });
        const data = await response.json();
        
        userAnswers.push({ scenario: currentScenario, answer: answer });
        
        if (data.is_correct) {
            correctAnswers++;
            score += data.points;
            showCorrectFeedback();
            setTimeout(() => nextScenario(), 2000);
        } else {
            wrongAnswers++;
            showWrongFeedback(answer);
        }
    }

    function showCorrectFeedback() {
        document.getElementById('scenario-screen').classList.add('hidden');
        document.getElementById('feedback-screen').classList.remove('hidden');
        
        const feedbackBox = document.getElementById('feedback-box');
        feedbackBox.className = 'border-3 border-green-500 bg-green-50 rounded-lg p-6';
        
        document.getElementById('feedback-icon').textContent = '✅';
        document.getElementById('feedback-title').textContent = 'Geweldig! Goed antwoord!';
        
        const scenario = scenarios[currentScenario];
        const correctOption = 'option_' + scenario.correct_answer.toLowerCase();
        document.getElementById('chosen-answer').textContent = scenario[correctOption];
        document.getElementById('story-result').textContent = 'Je hebt de juiste keuze gemaakt en het datalek voorkomen! Het bedrijf waardeert je alertheid en verantwoordelijkheid. 🎉';
        
        document.getElementById('explanation-section').style.display = 'none';
        document.querySelector('#feedback-screen button').style.display = 'none';
    }

    function showWrongFeedback(answer) {
        const scenario = scenarios[currentScenario];
        
        document.getElementById('scenario-screen').classList.add('hidden');
        document.getElementById('feedback-screen').classList.remove('hidden');
        
        const feedbackBox = document.getElementById('feedback-box');
        feedbackBox.className = 'border-3 border-red-500 bg-red-50 rounded-lg p-6';
        
        document.getElementById('feedback-icon').textContent = '❌';
        document.getElementById('feedback-title').textContent = 'Oeps! Dat ging niet helemaal goed...';
        
        const optionKey = 'option_' + answer.toLowerCase();
        document.getElementById('chosen-answer').textContent = `"${scenario[optionKey]}"`;
        
        const feedbackStory = 'feedback_' + answer.toLowerCase() + '_story';
        const feedbackExpl = 'feedback_' + answer.toLowerCase() + '_explanation';
        const feedbackCorr = 'feedback_' + answer.toLowerCase() + '_correct';
        
        document.getElementById('story-result').textContent = scenario[feedbackStory];
        document.getElementById('explanation').textContent = scenario[feedbackExpl];
        document.getElementById('correct-answer-text').textContent = scenario[feedbackCorr];
        
        document.getElementById('explanation-section').style.display = 'block';
        document.querySelector('#feedback-screen button').style.display = 'block';
    }

    async function nextScenario() {
        currentScenario++;
        
        if (currentScenario < scenarios.length) {
            document.getElementById('feedback-screen').classList.add('hidden');
            document.getElementById('scenario-screen').classList.remove('hidden');
            loadScenario(currentScenario);
        } else {
            await completeGame();
            showScore();
        }
    }

    async function completeGame() {
        const response = await fetch('textrpg.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'action=complete_game'
        });
        const data = await response.json();
        
        if (data.success) {
            score = data.score.total_score;
            correctAnswers = data.score.correct_count;
            wrongAnswers = data.score.wrong_count;
        }
    }

    function showScore() {
        document.getElementById('feedback-screen').classList.add('hidden');
        document.getElementById('scenario-screen').classList.add('hidden');
        document.getElementById('score-screen').classList.remove('hidden');
        
        document.getElementById('final-score').textContent = `${score}/100`;
        document.getElementById('correct-count').textContent = correctAnswers;
        document.getElementById('wrong-count').textContent = wrongAnswers;
        
        let badges = '';
        if (score >= 90) badges = '⭐⭐⭐';
        else if (score >= 70) badges = '⭐⭐';
        else if (score >= 50) badges = '⭐';
        else badges = '-';
        document.getElementById('badges').textContent = badges;
    }

    async function showLeaderboard() {
        document.getElementById('score-screen').classList.add('hidden');
        document.getElementById('leaderboard-screen').classList.remove('hidden');
        
        // Haal leaderboard op
        const response = await fetch('textrpg.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'action=get_leaderboard'
        });
        const data = await response.json();
        
        if (data.success) {
            displayLeaderboard(data.leaderboard, data.user_rank);
        }
        
        // Haal statistieken op
        const statsResponse = await fetch('textrpg.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'action=get_statistics'
        });
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
            displayStatistics(statsData.statistics);
        }
    }

    function displayLeaderboard(leaderboard, userRank) {
        const container = document.getElementById('leaderboard-content');
        container.innerHTML = '';
        
        leaderboard.forEach((entry, index) => {
            const isCurrentUser = entry.username === '<?php echo $user['username']; ?>';
            const div = document.createElement('div');
            div.className = `bg-white border-b border-gray-200 p-4 flex items-center gap-4 ${isCurrentUser ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''}`;
            
            const rankColor = index < 3 ? 'text-yellow-500' : 'text-gray-600';
            
            div.innerHTML = `
                <div class="text-2xl font-bold ${rankColor} w-10">${index + 1}</div>
                <div class="flex-1">
                    <div class="font-bold text-gray-800">${entry.username}${isCurrentUser ? ' 👈' : ''}</div>
                </div>
                <div class="text-xl font-bold text-green-500">${entry.total_score}</div>
            `;
            container.appendChild(div);
        });
        
        // Update rank display
        document.getElementById('rank').textContent = `#${userRank}`;
    }

    function displayStatistics(statistics) {
        const container = document.getElementById('stats-container');
        container.innerHTML = '';
        
        scenarios.forEach((scenario, index) => {
            const stats = statistics[scenario.id] || {A: 0, B: 0, C: 0, D: 0};
            const userAnswer = userAnswers.find(a => a.scenario === index);
            
            const statCard = document.createElement('div');
            statCard.className = 'border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50';
            
            let barsHTML = '';
            ['A', 'B', 'C', 'D'].forEach(option => {
                const percentage = stats[option] || 0;
                const isCorrect = option === scenario.correct_answer;
                const isUserChoice = userAnswer && userAnswer.answer === option;
                const barColor = isCorrect ? 'bg-green-500' : 'bg-blue-500';
                
                barsHTML += `
                    <div class="flex items-center gap-3">
                        <div class="font-bold text-gray-700 w-6 ${isUserChoice ? 'text-blue-600' : ''}">${option}${isUserChoice ? ' 👈' : ''}</div>
                        <div class="flex-1 bg-gray-200 rounded h-6 overflow-hidden">
                            <div class="${barColor} h-full flex items-center justify-end pr-2 text-white text-xs font-bold" style="width: ${percentage}%">
                                ${percentage}%${isCorrect ? ' ✓' : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            statCard.innerHTML = `
                <h4 class="font-bold text-gray-800 mb-3 text-sm">${scenario.title}</h4>
                <div class="space-y-2">
                    ${barsHTML}
                </div>
            `;
            
            container.appendChild(statCard);
        });
    }
    </script>
</body>
</html>