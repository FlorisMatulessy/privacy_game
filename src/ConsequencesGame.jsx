import { useState } from 'react';

console.log('ConsequencesGame.jsx loaded!');

const scenarios = [
  {
    id: 1,
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
        story: "Je sluit de laptop. Maar oh nee! Joost had een belangrijke vergadering via Teams en nu is die plots afgesloten. 💻🚫",
        explanation: "Hoewel je bedoeling goed was, had je niet zomaar de laptop mogen afsluiten.",
        correctAnswer: "Het juiste antwoord was D: Beveiliging waarschuwen."
      },
      B: {
        story: "Je loopt door. Een uur later maakt de schoonmaker een foto. De foto komt op sociale media. AVG-boete van €50.000. 📸💸",
        explanation: "Niets doen is NOOIT de juiste keuze bij een beveiligingsrisico.",
        correctAnswer: "Het juiste antwoord was D."
      },
      C: {
        story: "Je maakt een foto. De beveiliging ziet dit en denkt dat JIJ klantgegevens steelt! 📸🚫",
        explanation: "Het maken van een foto van gevoelige gegevens is NOOIT toegestaan.",
        correctAnswer: "Het juiste antwoord was D."
      }
    }
  },
  {
    id: 2,
    title: "Scenario 2: Verdachte e-mail",
    text: "Je krijgt een e-mail van je bank dat je account is geblokkeerd. De mail ziet er professioneel uit. Wat doe je?",
    options: {
      A: "Ik klik op de link om te kijken of het echt is",
      B: "Ik delete de mail en ga verder met werken",
      C: "Ik stuur de mail door naar IT/security",
      D: "Ik bel het nummer in de mail"
    },
    correct: "C",
    points: 20,
    feedback: {
      A: {
        story: "Je klikt op de link. De volgende dag zijn al je accounts gehacked! 🎣💸",
        explanation: "NOOIT op links klikken in verdachte e-mails!",
        correctAnswer: "Het juiste antwoord was C."
      },
      B: {
        story: "Je delete de mail. Maar je collega's krijgen dezelfde mail en sommigen trappen erin! 😔🚨",
        explanation: "Verdachte mails moeten ALTIJD gemeld worden.",
        correctAnswer: "Het juiste antwoord was C."
      },
      D: {
        story: "Je belt het nummer. Je wordt gevraagd om je BSN. De volgende dag is je identiteit gestolen! 📞🚫",
        explanation: "Telefoonnummers in phishing mails leiden naar oplichters!",
        correctAnswer: "Het juiste antwoord was C."
      }
    }
  },
  {
    id: 3,
    title: "Scenario 3: Onbekende USB-stick",
    text: "Je vindt een USB-stick op je bureau. Wat doe je?",
    options: {
      A: "Ik steek hem in mijn laptop om te kijken",
      B: "Ik vraag aan collega's of iemand hem herkent",
      C: "Ik breng de USB direct naar IT/security",
      D: "Ik gooi hem weg"
    },
    correct: "C",
    points: 20,
    feedback: {
      A: {
        story: "Je steekt de USB in. Het hele netwerk wordt geïnfecteerd met ransomware! 🦠💻",
        explanation: "NOOIT een onbekende USB-stick in je computer steken!",
        correctAnswer: "Het juiste antwoord was C."
      },
      B: {
        story: "Je vraagt rond, niemand herkent hem. Je steekt hem toch in... BOOM! Malware. 😱⚡",
        explanation: "Een onbekende USB blijft gevaarlijk.",
        correctAnswer: "Het juiste antwoord was C."
      },
      D: {
        story: "Je gooi hem weg. De schoonmaker vindt hem en geeft hem aan iemand anders die het netwerk infecteert. 🗑️😬",
        explanation: "Weggooien lost het probleem niet op.",
        correctAnswer: "Het juiste antwoord was C."
      }
    }
  }
];

export default function ConsequencesGame({ onNavigateTo }) {
  console.log('ConsequencesGame rendered!', { onNavigateTo });

  const [gameState, setGameState] = useState('start');
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const startGame = () => {
    console.log('Game started!');
    setGameState('playing');
    setCurrentScenario(0);
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
  };

  const selectAnswer = (answer) => {
    console.log('Answer selected:', answer);
    const scenario = scenarios[currentScenario];
    const correct = answer === scenario.correct;
    
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setGameState('feedback');
    
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + scenario.points);
      setTimeout(() => nextScenario(), 2000);
    } else {
      setWrongAnswers(prev => prev + 1);
    }
  };

  const nextScenario = () => {
    console.log('Next scenario');
    if (currentScenario + 1 < scenarios.length) {
      setCurrentScenario(prev => prev + 1);
      setGameState('playing');
      setSelectedAnswer(null);
    } else {
      setGameState('score');
    }
  };

  const resetGame = () => {
    console.log('Game reset');
    setGameState('start');
    setCurrentScenario(0);
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setSelectedAnswer(null);
  };

  console.log('Current game state:', gameState);

  // START SCREEN
  if (gameState === 'start') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef)', padding: '2rem' }}>
        <nav style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '1rem', marginBottom: '2rem', borderRadius: '0.5rem' }}>
          <button
            onClick={() => onNavigateTo("home")}
            style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600' }}
          >
            ← Terug naar menu
          </button>
        </nav>

        <div style={{ maxWidth: '48rem', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>🔒 Datalek Preventie Spel</h1>
            <p style={{ fontSize: '1.25rem', color: '#6c757d' }}>Bescherm de gemeente tegen datalekken!</p>
          </div>

          <div style={{ background: '#e7f5ff', borderLeft: '4px solid #007bff', padding: '1.5rem', marginBottom: '1.5rem', borderRadius: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Welkom bij de Gemeente!</h2>
            <p style={{ marginBottom: '1rem' }}>Je werkt bij de gemeente en bent verantwoordelijk voor het beschermen van gevoelige informatie.</p>
            <p style={{ marginBottom: '1rem' }}>In dit spel krijg je <strong>{scenarios.length} scenario's</strong> met elk <strong>4 antwoordopties</strong>.</p>
            <p><strong>Let op:</strong> Slechts één antwoord is volledig correct!</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', border: '2px solid #dee2e6' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{scenarios.length} Scenario's</h3>
              <p style={{ fontSize: '0.875rem', color: '#6c757d' }}>Realistische situaties</p>
            </div>
            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', border: '2px solid #dee2e6' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>4 Keuzes</h3>
              <p style={{ fontSize: '0.875rem', color: '#6c757d' }}>Per scenario</p>
            </div>
            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', border: '2px solid #dee2e6' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Leer & Win</h3>
              <p style={{ fontSize: '0.875rem', color: '#6c757d' }}>Feedback op fouten</p>
            </div>
          </div>

          <button
            onClick={startGame}
            style={{ width: '100%', background: '#007bff', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', border: 'none', fontWeight: 'bold', fontSize: '1.25rem', cursor: 'pointer' }}
          >
            🚀 Start het spel
          </button>
        </div>
      </div>
    );
  }

  // PLAYING SCREEN
  if (gameState === 'playing') {
    const scenario = scenarios[currentScenario];
    const progress = ((currentScenario + 1) / scenarios.length) * 100;

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef)', padding: '2rem' }}>
        <nav style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '1rem', marginBottom: '2rem', borderRadius: '0.5rem' }}>
          <button
            onClick={() => onNavigateTo("home")}
            style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600' }}
          >
            ← Terug
          </button>
        </nav>

        <div style={{ maxWidth: '48rem', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>
              <span>Voortgang</span>
              <span>Scenario {currentScenario + 1} van {scenarios.length}</span>
            </div>
            <div style={{ width: '100%', background: '#e9ecef', borderRadius: '9999px', height: '0.5rem' }}>
              <div style={{ background: '#007bff', height: '0.5rem', borderRadius: '9999px', width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
          </div>

          <div style={{ background: '#f8f9fa', border: '2px dashed #dee2e6', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>{scenario.title}</h2>
            <p style={{ color: '#495057', lineHeight: '1.6' }}>{scenario.text}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(scenario.options).map(([key, value]) => (
              <button
                key={key}
                onClick={() => selectAnswer(key)}
                style={{ width: '100%', textAlign: 'left', padding: '1rem', border: '2px solid #007bff', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.target.style.background = '#e7f5ff'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                <span style={{ fontWeight: 'bold', color: '#007bff' }}>{key}.</span> {value}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // FEEDBACK SCREEN
  if (gameState === 'feedback') {
    const scenario = scenarios[currentScenario];
    const feedback = isCorrect ? null : scenario.feedback[selectedAnswer];

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef)', padding: '2rem' }}>
        <nav style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '1rem', marginBottom: '2rem', borderRadius: '0.5rem' }}>
          <button onClick={() => onNavigateTo("home")} style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600' }}>← Terug</button>
        </nav>

        <div style={{ maxWidth: '48rem', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ border: `3px solid ${isCorrect ? '#28a745' : '#dc3545'}`, background: isCorrect ? '#d4edda' : '#f8d7da', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <div style={{ textAlign: 'center', fontSize: '4rem', marginBottom: '1rem' }}>{isCorrect ? '✅' : '❌'}</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
              {isCorrect ? 'Geweldig! Goed antwoord!' : 'Oeps! Dat ging niet helemaal goed...'}
            </h2>

            {isCorrect ? (
              <>
                <p style={{ marginBottom: '1rem' }}>Je hebt gekozen voor: <strong>{scenario.options[scenario.correct]}</strong></p>
                <p style={{ color: '#6c757d' }}>Je hebt de juiste keuze gemaakt! 🎉</p>
              </>
            ) : (
              <>
                <p style={{ marginBottom: '1rem' }}>Je hebt gekozen voor: <strong>"{scenario.options[selectedAnswer]}"</strong></p>
                <div style={{ background: 'white', borderLeft: '4px solid #dc3545', padding: '1rem', marginBottom: '1rem', borderRadius: '0.25rem' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Wat er gebeurde:</p>
                  <p style={{ color: '#6c757d' }}>{feedback.story}</p>
                </div>
                <div style={{ background: 'white', borderLeft: '4px solid #007bff', padding: '1rem', borderRadius: '0.25rem', marginBottom: '1.5rem' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>💡 Waarom is dit fout?</p>
                  <p style={{ color: '#6c757d', marginBottom: '0.75rem' }}>{feedback.explanation}</p>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>✅ Wat had beter gekund?</p>
                  <p style={{ color: '#6c757d' }}>{feedback.correctAnswer}</p>
                </div>
                <button onClick={nextScenario} style={{ width: '100%', background: '#007bff', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                  Volgende scenario
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // SCORE SCREEN
  if (gameState === 'score') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef)', padding: '2rem' }}>
        <nav style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '1rem', marginBottom: '2rem', borderRadius: '0.5rem' }}>
          <button onClick={() => onNavigateTo("home")} style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600' }}>← Terug</button>
        </nav>

        <div style={{ maxWidth: '48rem', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', border: '2px dashed #dee2e6', borderRadius: '0.5rem', padding: '2rem', background: '#f8f9fa' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🎉 Spel voltooid!</h2>
            <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>Goed gedaan! Hier is je score:</p>

            <div style={{ fontSize: '4.5rem', fontWeight: 'bold', color: '#28a745', margin: '2rem 0' }}>{score}/60</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #dee2e6' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>{correctAnswers}</div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Correct</div>
              </div>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #dee2e6' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>{wrongAnswers}</div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Fout</div>
              </div>
            </div>

            <button onClick={resetGame} style={{ width: '100%', background: '#007bff', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
              Speel opnieuw
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}