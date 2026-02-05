<?php
session_start();
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
            <button onclick="backToMenu()" id="nav-left-btn" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm">
                ← Terug naar menu
            </button>
        </div>
    </nav>
    
    <!-- Start Scherm -->
    <div id="start-screen" class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-gray-800 mb-4">🔒 Datalek Preventie Spel</h1>
                <p class="text-xl text-gray-600">Bescherm de gemeente tegen datalekken!</p>
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
                    <p class="text-sm text-gray-600">Krijg feedback en vergelijk je score</p>
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
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                        <div id="correct-count" class="text-3xl font-bold text-green-500">0</div>
                        <div class="text-sm text-gray-600">Correct</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                        <div id="wrong-count" class="text-3xl font-bold text-red-500">0</div>
                        <div class="text-sm text-gray-600">Fout</div>
                    </div>
                </div>

                <button onclick="location.reload()" class="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                    Speel opnieuw
                </button>
            </div>
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
                <button onclick="toggleSound()" class="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                    <span id="sound-icon">🔊</span>
                    <span>Geluid: <span id="sound-status">Aan</span></span>
                </button>
                <div class="flex items-center gap-3">
                    <span>Volume:</span>
                    <input type="range" min="0" max="100" value="50" class="slider" onchange="changeVolume(this.value)">
                    <span id="volume-percentage">50%</span>
                </div>
            </div>
        </div>
    </footer>

    <!-- GEBRUIK GAME.JS VOOR ALLE DATA & LOGICA -->
    <script src="game.js"></script>
</body>
</html>