// Game state
let currentScenario = 0;
let score = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let userAnswers = [];
let soundEnabled = true;

// Audio elements
let menuMusic;
let gameMusic;

// Scenario data
const scenarios = [
    {
        title: "Scenario 1: De vergeten laptop",
        text: "Je collega Joost moest snel weg en heeft zijn laptop open laten staan op zijn bureau met klantgegevens zichtbaar op het scherm. Andere collega's lopen regelmatig langs dit bureau. Wat doe je?",
        options: {
            A: "Ik sluit de laptop en leg een briefje neer voor Joost",
            B: "Ik laat het zo staan, Joost komt vast zo terug",
            C: "Ik maak een foto van het scherm om te laten zien wat er gebeurt",
            D: "Ik waarschuw de beveiliging en informeer mijn leidinggevende"
        },
        correct: "D",
        points: 20,
        feedback: {
            A: {
                story: "Je sluit de laptop. Maar oh nee! Joost had een belangrijke vergadering via Teams en nu is die plots afgesloten. De klant is boos en denkt dat Joost midden in de meeting is opgehangen. 💻🚫",
                explanation: "Hoewel je bedoeling goed was, had je niet zomaar de laptop mogen afsluiten zonder te controleren of er actieve vergaderingen waren. Je hebt wel het datalek voorkomen, maar niet op de beste manier gehandeld.",
                correctAnswer: "Het juiste antwoord was D: Beveiliging waarschuwen en je leidinggevende informeren. Zij kunnen de situatie professioneel afhandelen zonder lopende processen te verstoren."
            },
            B: {
                story: "Je loopt door. Een uur later komt de schoonmaker binnen en maakt per ongeluk een foto van het scherm. De foto komt op sociale media en nu zijn er klantgegevens gelekt. Je bedrijf krijgt een AVG-boete van €50.000. 📸💸",
                explanation: "Niets doen is NOOIT de juiste keuze bij een duidelijk beveiligingsrisico. Je hebt een verantwoordelijkheid om te handelen wanneer je vertrouwelijke informatie onbeschermd ziet staan.",
                correctAnswer: "Het juiste antwoord was D: Beveiliging waarschuwen en je leidinggevende informeren. Zo neem je verantwoordelijkheid zonder zelf risico's te nemen."
            },
            C: {
                story: "Je maakt een foto met je telefoon. De beveiliging ziet dit op de camera's en denkt dat JIJ klantgegevens probeert te stelen! Je moet uitleg geven aan HR en je werktelefoon wordt ingenomen voor onderzoek. 📸🚫",
                explanation: "Het maken van een foto van gevoelige gegevens is NOOIT toegestaan, ook niet met goede bedoelingen. Je kopieert vertrouwelijke klantgegevens naar een onbeveiligd apparaat en creëert een nieuw beveiligingsrisico.",
                correctAnswer: "Het juiste antwoord was D: Beveiliging waarschuwen en je leidinggevende informeren. Zo los je het probleem op zonder zelf een datalek te veroorzaken."
            }
        }
    },
    {
        title: "Scenario 2: Verwijderd bestand",
        text: "Gerard heeft per ongeluk een belangrijk bestand verwijderd toen hij oude data wilde opruimen. Hij is in paniek en vraagt jou om hulp. Wat doe je?",
        options: {
            A: "Ik probeer het bestand zelf te herstellen met recovery software",
            B: "Ik zeg dat hij maar een nieuw bestand moet maken",
            C: "Ik meld dit direct bij de IT-afdeling en vraag om een backup restore",
            D: "Ik download gratis recovery software van internet en installeer het"
        },
        correct: "C",
        points: 15,
        feedback: {
            A: {
                story: "Je probeert zelf het bestand te herstellen, maar overschrijft per ongeluk andere belangrijke bestanden. Nu zijn er NOG MEER bestanden kwijt! Gerard is nu nog meer in paniek. IT is boos omdat je de situatie erger hebt gemaakt. 😱💾",
                explanation: "Recovery operaties moeten door professionals worden uitgevoerd. Door zelf te prutsen kun je de situatie erger maken en belangrijke data permanent verwijderen.",
                correctAnswer: "Het juiste antwoord was C: Meld dit bij IT en vraag om een backup restore. IT heeft de juiste tools en expertise om dit veilig te doen."
            },
            B: {
                story: "Gerard maakt een nieuw bestand, maar dit bevat niet alle cruciale informatie van het origineel. Bij een audit blijkt belangrijke compliance data te ontbreken. Het bedrijf krijgt een boete van €25.000. 📋💸",
                explanation: "Belangrijke bedrijfsdata moet altijd worden hersteld, niet opnieuw gemaakt. Er kunnen compliance, juridische of financiële risico's zijn aan dataverlies.",
                correctAnswer: "Het juiste antwoord was C: Meld dit bij IT en vraag om een backup restore. Zo wordt de originele data correct hersteld."
            },
            D: {
                story: "Je download 'gratis recovery software' maar het blijkt malware te zijn! Nu is het hele netwerk geïnfecteerd met ransomware. Alle bestanden zijn versleuteld en de hackers eisen €100.000 losgeld. 🦠💰",
                explanation: "NOOIT ongeautoriseerde software downloaden en installeren op bedrijfssystemen! Dit is een van de grootste beveiligingsrisico's. Gratis software van onbekende bronnen kan malware bevatten.",
                correctAnswer: "Het juiste antwoord was C: Meld dit bij IT en vraag om een backup restore. IT heeft veilige, goedgekeurde tools voor data recovery."
            }
        }
    },
    {
        title: "Scenario 3: Verdachte e-mail",
        text: "Je krijgt een e-mail die lijkt te komen van je bank. Er staat dat je account is geblokkeerd en dat je op een link moet klikken om het te activeren. De mail ziet er professioneel uit. Wat doe je?",
        options: {
            A: "Ik klik op de link om te kijken of het echt is",
            B: "Ik delete de mail en ga verder met werken",
            C: "Ik stuur de mail door naar IT/security om te checken of het phishing is",
            D: "Ik bel het nummer in de mail om te vragen of het klopt"
        },
        correct: "C",
        points: 20,
        feedback: {
            A: {
                story: "Je klikt op de link en voert je inloggegevens in. De volgende dag zijn al je accounts gehacked! Je bankrekening is leeg, je bedrijfsaccount is gebruikt om malware te verspreiden, en je moet alle wachtwoorden resetten. 🎣💸",
                explanation: "NOOIT op links klikken in verdachte e-mails! Dit is klassieke phishing. Banken vragen nooit om via e-mail in te loggen. Hackers maken professioneel ogende mails om je te misleiden.",
                correctAnswer: "Het juiste antwoord was C: Stuur de mail door naar IT/security. Zij kunnen checken of het phishing is en waarschuwen andere medewerkers."
            },
            B: {
                story: "Je delete de mail. Maar je collega's krijgen dezelfde mail en sommigen trappen erin! Er ontstaat een groot datalek. IT had dit kunnen voorkomen als jij het had gemeld. Nu ben je verantwoordelijk gehouden voor niet escaleren. 😔🚨",
                explanation: "Verdachte mails moeten ALTIJD gemeld worden bij IT/security. Jij bent misschien niet in de val getrapt, maar anderen wel. Door te melden help je het hele bedrijf beschermen.",
                correctAnswer: "Het juiste antwoord was C: Stuur de mail door naar IT/security zodat zij iedereen kunnen waarschuwen en de dreiging kunnen blokkeren."
            },
            D: {
                story: "Je belt het nummer in de mail. Je wordt doorverbonden met 'een medewerker' die om je rekeningnummer, BSN en verificatiecode vraagt. Je geeft dit. De volgende dag is je identiteit gestolen! 📞🚫",
                explanation: "Telefoonnummers in phishing mails leiden naar de oplichters zelf! Ze doen alsof ze van de bank zijn. Gebruik ALTIJD het officiële nummer van de website van je bank, niet uit een e-mail.",
                correctAnswer: "Het juiste antwoord was C: Stuur de mail door naar IT/security. Zij kunnen verifiëren of het echt is via officiële kanalen."
            }
        }
    },
    {
        title: "Scenario 4: Data aanvraag oud-stagiair",
        text: "Een oude stagiair die 2 jaar geleden bij jullie heeft gewerkt, stuurt een mail. Hij vraagt om zijn persoonlijke data en informatie over zijn stageopdrachten voor zijn CV. Hoe reageer je?",
        options: {
            A: "Ik stuur hem direct een Word document met alle info per mail",
            B: "Ik verwijs hem naar HR en de Privacy Officer voor een officiële aanvraag",
            C: "Ik zeg dat we die data niet meer hebben en negeer de vraag",
            D: "Ik geef hem toegang tot de oude bedrijfsdrive zodat hij het zelf kan zoeken"
        },
        correct: "B",
        points: 15,
        feedback: {
            A: {
                story: "Je stuurt de data per onbeveiligde e-mail. De mail wordt onderschept en nu heeft een hacker toegang tot gevoelige bedrijfsinformatie die in het document stond. Ook blijkt er data van andere stagiairs in te zitten! AVG overtreding - boete €15.000. 📧🚫",
                explanation: "Persoonlijke data mag NOOIT onbeveiligd worden verstuurd. Ook moet je checken of de aanvrager echt is wie hij zegt te zijn, en alleen zijn eigen data verstrekken via officiële, beveiligde kanalen.",
                correctAnswer: "Het juiste antwoord was B: Verwijs naar HR en Privacy Officer. Zij volgen het officiële AVG-proces met verificatie en beveiligde verstrekking."
            },
            C: {
                story: "De ex-stagiair dient een officiële AVG-klacht in bij de Autoriteit Persoonsgegevens. Blijkt dat jullie WEL verplicht zijn om zijn data te verstrekken binnen 30 dagen. Het bedrijf krijgt een boete van €10.000 voor non-compliance. 📋💸",
                explanation: "Onder de AVG heeft iedereen recht op inzage in zijn eigen data. Je mag dit niet weigeren of negeren. Er is een officieel proces dat moet worden gevolgd.",
                correctAnswer: "Het juiste antwoord was B: Verwijs naar HR en Privacy Officer. Zij behandelen AVG-verzoeken volgens de wet."
            },
            D: {
                story: "Je geeft hem oude login credentials. Hij logt in op de drive, maar nu heeft hij ook toegang tot ALLE huidige projecten en klantdata! Hij download per ongeluk vertrouwelijke informatie. Enorm datalek! 🔓💾",
                explanation: "NOOIT oude accounts heractiveren of toegang geven tot systemen aan ex-medewerkers! Dit is een enorm beveiligingsrisico. Accounts moeten direct na uitdienst worden geblokkeerd.",
                correctAnswer: "Het juiste antwoord was B: Verwijs naar HR en Privacy Officer. Zij verstrekken alleen zijn eigen data via veilige weg, zonder systeemtoegang."
            }
        }
    },
    {
        title: "Scenario 5: Onbekende USB-stick",
        text: "Je vindt een USB-stick zonder label op je bureau. Je denkt dat je baas het heeft achtergelaten, maar je weet het niet zeker. Je bent nieuwsgierig wat erop staat. Wat doe je?",
        options: {
            A: "Ik steek hem in mijn werk laptop om te kijken wat erop staat",
            B: "Ik vraag aan collega's of iemand hem herkent, en steek hem pas daarna in",
            C: "Ik breng de USB direct naar IT/security zonder hem in een computer te steken",
            D: "Ik gooi hem weg in de prullenbak"
        },
        correct: "C",
        points: 20,
        feedback: {
            A: {
                story: "Je steekt de USB in je laptop. Binnen 5 seconden wordt het hele netwerk geïnfecteerd met ransomware! Blijkt een 'USB drop attack' te zijn - hackers laten USB-sticks achter in de hoop dat nieuwsgierige medewerkers ze insteken. Alle bedrijfsdata is nu versleuteld. 🦠💻",
                explanation: "NOOIT een onbekende USB-stick in je computer steken! Dit is een veel gebruikte hacktechniek. USB-sticks kunnen automatisch malware installeren zodra je ze insteekt.",
                correctAnswer: "Het juiste antwoord was C: Breng naar IT/security. Zij hebben veilige systemen om de inhoud te checken zonder het netwerk te riskeren."
            },
            B: {
                story: "Je vraagt rond, niemand herkent hem. Je denkt 'ach, dan kijk ik wel even'. Je steekt hem in... BOOM! Crypto-mining malware. Je laptop wordt extreem traag en het bedrijfsnetwerk crasht. IT ontdekt dat JIJ de bron was. 😱⚡",
                explanation: "Ook al vraag je rond, een onbekende USB blijft gevaarlijk. Hackers rekenen erop dat nieuwsgierigheid zegeviert. Het checken met collega's maakt het niet veiliger om in te steken.",
                correctAnswer: "Het juiste antwoord was C: Breng naar IT/security, zelfs als niemand hem herkent. Laat professionals het veilig onderzoeken."
            },
            D: {
                story: "Je gooit hem weg. De schoonmaker vindt hem en geeft hem aan iemand anders die wel nieuwsgierig is. Die persoon steekt hem in zijn laptop en infecteert het netwerk. Had voorkomen kunnen worden! 🗑️😬",
                explanation: "Een USB weggooien lost het probleem niet op - iemand anders kan hem vinden en gebruiken. Ook kan er waardevolle bedrijfsinformatie op staan die verloren gaat.",
                correctAnswer: "Het juiste antwoord was C: Breng naar IT/security. Zij kunnen hem veilig analyseren en bepalen of het gevaarlijk is of belangrijke data bevat."
            }
        }
    },
    {
        title: "Scenario 6: Wachtwoord van collega",
        text: "Je collega Emma vraagt of je even haar wachtwoord mag gebruiken om een belangrijk document te printen omdat haar account meer rechten heeft. Ze is zelf in een meeting. Wat doe je?",
        options: {
            A: "Ik vraag haar wachtwoord en log in om te helpen",
            B: "Ik wacht tot Emma uit de meeting komt en help haar daarna",
            C: "Ik vraag Emma of ze even uit de meeting kan om zelf in te loggen",
            D: "Ik vraag IT om mij tijdelijk dezelfde rechten te geven"
        },
        correct: "C",
        points: 10,
        feedback: {
            A: {
                story: "Emma geeft je haar wachtwoord. Later blijkt dat JIJ met haar account per ongeluk vertrouwelijke documenten hebt geopend waar je geen toegang toe had. Bij een audit wordt dit ontdekt. Emma én jij krijgen een waarschuwing voor het delen van credentials. 🔑🚫",
                explanation: "Wachtwoorden delen is ALTIJD verboden, zelfs tussen collega's! Dit ondermijnt alle security. Als er iets misgaat, is onduidelijk wie verantwoordelijk is. Je mag ook geen toegang krijgen tot dingen waarvoor je geen autorisatie hebt.",
                correctAnswer: "Het juiste antwoord was C: Vraag Emma even uit de meeting te komen om zelf in te loggen. Zo blijft haar account veilig en blijft duidelijk wie wat doet."
            },
            B: {
                story: "Je wacht 2 uur op Emma. Ondertussen loopt het project vertraging op en de klant is boos omdat het document te laat is. Je manager is teleurgesteld dat je niet proactief een oplossing hebt gezocht. ⏰😔",
                explanation: "Hoewel je de security regel respecteert (goed!), had je een betere oplossing kunnen zoeken. Emma kort uit de meeting halen of IT om tijdelijke rechten vragen was beter geweest.",
                correctAnswer: "Het juiste antwoord was C: Vraag Emma even uit de meeting te komen. Zo respecteer je de security maar help je ook snel."
            },
            D: {
                story: "Je vraagt IT om tijdelijke rechten. Ze zeggen dat dit een lang proces is (formulieren, goedkeuring manager, wachttijd 2 dagen). Het document is pas 3 dagen later klaar. Te laat voor de deadline. 📋⏳",
                explanation: "IT rechten aanvragen is op zich een goede gedachte voor security, maar niet praktisch voor een eenmalige urgente taak. In dit geval was het sneller en veiliger om Emma zelf even te laten inloggen.",
                correctAnswer: "Het juiste antwoord was C: Vraag Emma even uit de meeting. Dit is de snelste én veiligste oplossing voor een eenmalige actie."
            }
        }
    }
];

// Mock statistics for leaderboard
const mockStats = {
    0: { A: 25, B: 15, C: 10, D: 50 },
    1: { A: 20, B: 10, C: 55, D: 15 },
    2: { A: 30, B: 10, C: 50, D: 10 },
    3: { A: 35, B: 40, C: 15, D: 10 },
    4: { A: 40, B: 15, C: 35, D: 10 },
    5: { A: 30, B: 20, C: 40, D: 10 }
};

// Initialize on load
window.addEventListener('DOMContentLoaded', function() {
    menuMusic = document.getElementById('menu-music');
    gameMusic = document.getElementById('game-music');
    
    // Set initial volume
    const initialVolume = 0.5;
    if (menuMusic) menuMusic.volume = initialVolume;
    if (gameMusic) gameMusic.volume = initialVolume;
    
    // Start menu music
    if (soundEnabled) {
        playMenuMusic();
    }
});

// Play menu music
function playMenuMusic() {
    if (gameMusic) gameMusic.pause();
    if (menuMusic && soundEnabled) {
        menuMusic.play().catch(e => console.log('Audio play prevented:', e));
    }
}

// Play game music
function playGameMusic() {
    if (menuMusic) menuMusic.pause();
    if (gameMusic && soundEnabled) {
        gameMusic.play().catch(e => console.log('Audio play prevented:', e));
    }
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    const statusEl = document.getElementById('sound-status');
    const iconEl = document.getElementById('sound-icon');
    
    if (statusEl) statusEl.textContent = soundEnabled ? 'Aan' : 'Uit';
    if (iconEl) iconEl.textContent = soundEnabled ? '🔊' : '🔇';
    
    if (soundEnabled) {
        // Determine which music to play based on current screen
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

// Change volume
function changeVolume(value) {
    const volume = value / 100;
    if (menuMusic) menuMusic.volume = volume;
    if (gameMusic) gameMusic.volume = volume;
    const percentEl = document.getElementById('volume-percentage');
    if (percentEl) percentEl.textContent = value + '%';
}

// Start game
function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('scenario-screen').classList.remove('hidden');
    
    playGameMusic();
    loadScenario(0);
}

// Back to menu - Works both standalone and in iframe
function backToMenu() {
    // Check if we're in an iframe (React app)
    if (window.parent !== window) {
        // Send message to parent (React app) to navigate back
        window.parent.postMessage({ type: 'navigate', route: 'home' }, '*');
    } else {
        // Standalone mode - reset to start screen
        resetGame();
    }
}

// Reset game to initial state
function resetGame() {
    currentScenario = 0;
    score = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    userAnswers = [];
    
    // Hide all screens
    document.getElementById('scenario-screen').classList.add('hidden');
    document.getElementById('feedback-screen').classList.add('hidden');
    document.getElementById('score-screen').classList.add('hidden');
    
    // Show start screen
    document.getElementById('start-screen').classList.remove('hidden');
    
    // Play menu music
    playMenuMusic();
}

// Load scenario
function loadScenario(index) {
    const scenario = scenarios[index];
    
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');
    
    if (progressText) progressText.textContent = `Scenario ${index + 1} van ${scenarios.length}`;
    if (progressBar) progressBar.style.width = `${((index + 1) / scenarios.length) * 100}%`;
    
    const titleEl = document.getElementById('scenario-title');
    const textEl = document.getElementById('scenario-text');
    
    if (titleEl) titleEl.textContent = scenario.title;
    if (textEl) textEl.textContent = scenario.text;
    
    const optionA = document.getElementById('option-a');
    const optionB = document.getElementById('option-b');
    const optionC = document.getElementById('option-c');
    const optionD = document.getElementById('option-d');
    
    if (optionA) optionA.textContent = scenario.options.A;
    if (optionB) optionB.textContent = scenario.options.B;
    if (optionC) optionC.textContent = scenario.options.C;
    if (optionD) optionD.textContent = scenario.options.D;
}

// Select answer
function selectAnswer(answer) {
    const scenario = scenarios[currentScenario];
    userAnswers.push({ scenario: currentScenario, answer: answer });
    
    if (answer === scenario.correct) {
        // Correct answer
        correctAnswers++;
        score += scenario.points;
        
        // Show correct feedback briefly then move to next
        showCorrectFeedback();
        
        setTimeout(() => {
            nextScenario();
        }, 2000);
        
    } else {
        // Wrong answer - show feedback
        wrongAnswers++;
        showWrongFeedback(answer);
    }
}

// Show correct feedback
function showCorrectFeedback() {
    document.getElementById('scenario-screen').classList.add('hidden');
    document.getElementById('feedback-screen').classList.remove('hidden');
    
    const feedbackBox = document.getElementById('feedback-box');
    if (feedbackBox) feedbackBox.className = 'border-3 border-green-500 bg-green-50 rounded-lg p-6';
    
    const iconEl = document.getElementById('feedback-icon');
    const titleEl = document.getElementById('feedback-title');
    const chosenEl = document.getElementById('chosen-answer');
    const storyEl = document.getElementById('story-result');
    
    if (iconEl) iconEl.textContent = '✅';
    if (titleEl) titleEl.textContent = 'Geweldig! Goed antwoord!';
    if (chosenEl) chosenEl.textContent = scenarios[currentScenario].options[scenarios[currentScenario].correct];
    if (storyEl) storyEl.textContent = 'Je hebt de juiste keuze gemaakt en het datalek voorkomen! Het bedrijf waardeert je alertheid en verantwoordelijkheid. 🎉';
    
    // Hide explanation sections for correct answer
    const storySection = document.getElementById('story-section');
    const explanationSection = document.getElementById('explanation-section');
    
    if (storySection) storySection.style.display = 'none';
    if (explanationSection) explanationSection.style.display = 'none';
    
    const nextBtn = document.querySelector('#feedback-screen button');
    if (nextBtn) nextBtn.style.display = 'none';
}

// Show wrong feedback
function showWrongFeedback(answer) {
    const scenario = scenarios[currentScenario];
    const feedback = scenario.feedback[answer];
    
    document.getElementById('scenario-screen').classList.add('hidden');
    document.getElementById('feedback-screen').classList.remove('hidden');
    
    const feedbackBox = document.getElementById('feedback-box');
    if (feedbackBox) feedbackBox.className = 'border-3 border-red-500 bg-red-50 rounded-lg p-6';
    
    const iconEl = document.getElementById('feedback-icon');
    const titleEl = document.getElementById('feedback-title');
    const chosenEl = document.getElementById('chosen-answer');
    const storyEl = document.getElementById('story-result');
    const explanationEl = document.getElementById('explanation');
    const correctEl = document.getElementById('correct-answer-text');
    
    if (iconEl) iconEl.textContent = '❌';
    if (titleEl) titleEl.textContent = 'Oeps! Dat ging niet helemaal goed...';
    
    const optionText = scenario.options[answer];
    if (chosenEl) chosenEl.textContent = `"${optionText}"`;
    if (storyEl) storyEl.textContent = feedback.story;
    if (explanationEl) explanationEl.textContent = feedback.explanation;
    if (correctEl) correctEl.textContent = feedback.correctAnswer;
    
    // Show all sections for wrong answer
    const storySection = document.getElementById('story-section');
    const explanationSection = document.getElementById('explanation-section');
    
    if (storySection) storySection.style.display = 'block';
    if (explanationSection) explanationSection.style.display = 'block';
    
    const nextBtn = document.querySelector('#feedback-screen button');
    if (nextBtn) nextBtn.style.display = 'block';
}

// Next scenario
function nextScenario() {
    currentScenario++;
    
    if (currentScenario < scenarios.length) {
        document.getElementById('feedback-screen').classList.add('hidden');
        document.getElementById('scenario-screen').classList.remove('hidden');
        loadScenario(currentScenario);
    } else {
        showScore();
    }
}

// Show score screen
function showScore() {
    document.getElementById('feedback-screen').classList.add('hidden');
    document.getElementById('scenario-screen').classList.add('hidden');
    document.getElementById('score-screen').classList.remove('hidden');
    
    const finalScoreEl = document.getElementById('final-score');
    const correctCountEl = document.getElementById('correct-count');
    const wrongCountEl = document.getElementById('wrong-count');
    
    if (finalScoreEl) finalScoreEl.textContent = `${score}/100`;
    if (correctCountEl) correctCountEl.textContent = correctAnswers;
    if (wrongCountEl) wrongCountEl.textContent = wrongAnswers;
}