import { useState, useEffect, useRef, useCallback } from 'react';

// Alle vragen uit questions.json (exact zoals in fruitninja game/questions.json)
const QUESTIONS_DATA = {
  "antwoordmodelAlgemeneRondes": [
    {
      "ronde": "Sociaal Domein",
      "vragen": [
        {
          "vraag": "Frits heeft voor een Wmo-aanvraag persoonsgegevens nodig van mevrouw Van Riet. Frits verwacht dat de WMO-aanvraag tot een positieve beschikking zal leiden en verwacht dan ook dat hij dan weer gegevens van mevrouw moet opvragen. Om administratieve rompslomp te voorkomen vraagt Frits vooraf of mevrouw toestemming wil geven voor het opvragen van haar gegevens bij alle andere afdelingen bij de gemeente. Mag dat?",
          "answers": {
            "A": "Nee, toestemming is in dit geval geen geldige grondslag.",
            "B": "Ja, toestemming kan altijd gegeven worden.",
            "C": "Ja, mits mevrouw Van Riet akkoord gaat."
          },
          "correct": "A",
          "toelichting": "Bij de uitvoering van publiekrechtelijke taken in het sociaal domein is er meestal een afhankelijkheidsrelatie tussen de betrokkenen en de gemeente. Weigeren mensen toestemming voor het verwerken van gegevens, dan kan dat gevolgen hebben voor een bepaalde voorziening.",
          "punten": 1
        },
        {
          "vraag": "De heer Bos stuurt voor zijn aanvraag voor een gehandicaptenparkeerplaats zijn volledige medische dossier per post op naar de gemeente. Zo kan de gemeente goed zien dat hij die parkeerplaats echt nodig heeft. Wat gaat er niet goed in deze casus?",
          "answers": {
            "A": "De gemeente mag medische gegevens verwerken als de burger deze vrijwillig opstuurt.",
            "B": "Voor de beoordeling van de aanvraag heeft de gemeente het volledige medische dossier niet nodig en mag zij deze gegevens daarom niet gebruiken.",
            "C": "De gemeente had de medische gegevens digitaal moeten ontvangen in plaats van per post."
          },
          "correct": "B",
          "toelichting": "Volgens het principe van dataminimalisatie uit de AVG mag de gemeente alleen persoonsgegevens verwerken die noodzakelijk zijn voor het doel van de aanvraag. Een volledig medisch dossier is hiervoor niet nodig.",
          "punten": 1
        },
        {
          "vraag": "Is het bouwjaar van een huis een persoonsgegeven?",
          "answers": {
            "A": "Ja, want het geeft informatie over de bewoner.",
            "B": "Nee, het bouwjaar heeft enkel betrekking op het huis en niet op een persoon.",
            "C": "Soms, afhankelijk van het adres."
          },
          "correct": "B",
          "toelichting": "Het bouwjaar van een huis is geen persoonsgegeven omdat het geen informatie over een identificeerbare persoon bevat.",
          "punten": 1
        },
        {
          "vraag": "Als ik op vakantie ga mag ik mijn werktelefoon altijd meenemen.",
          "answers": {
            "A": "Waar, want ik ben verantwoordelijk voor de telefoon.",
            "B": "Niet waar, er zijn landen waarbij bij aankomst je telefoon wordt aangesloten en alle inhoud wordt gekopieerd.",
            "C": "Alleen als je manager toestemming geeft."
          },
          "correct": "B",
          "toelichting": "Er zijn landen waar je werktelefoon bij aankomst kan worden gecontroleerd en de inhoud gekopieerd wordt. Neem daarom altijd je werktelefoon mee in overleg met je werkgever.",
          "punten": 1
        }
      ]
    }
  ]
};

const FruitItem = ({ type, position, onClick, isSliced, answerKey, answerText }) => {
  const colors = {
    correct: '#4ade80',
    wrong: '#ef4444'
  };

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: colors[type],
        cursor: isSliced ? 'default' : 'pointer',
        transition: 'all 0.3s ease',
        transform: isSliced ? 'scale(0) rotate(180deg)' : 'scale(1)',
        border: '4px solid white',
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: 'white',
        userSelect: 'none',
        zIndex: isSliced ? 0 : 10
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '4px' }}>
        {type === 'correct' ? '✓' : '✗'}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        {answerKey}
      </div>
    </div>
  );
};

export default function FruitNinjaGame({ onNavigateTo }) {
  const [gameState, setGameState] = useState('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [fruits, setFruits] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const timerRef = useRef(null);

  const allQuestions = QUESTIONS_DATA.antwoordmodelAlgemeneRondes[0].vragen;
  const currentQuestion = allQuestions[currentQuestionIndex];

  // End game callback
  const endGame = useCallback(() => {
    setGameState('results');
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [gameState, timeLeft, endGame]);

  // Spawn fruits effect - triggers ONLY when question index changes
  useEffect(() => {
    if (gameState === 'playing' && allQuestions[currentQuestionIndex]) {
      const question = allQuestions[currentQuestionIndex];
      const newFruits = [];
      const answers = Object.entries(question.answers);
      
      // Fixed positions for 3 fruits (A, B, C)
      const positions = [
        { x: 15, y: 30 },
        { x: 42, y: 25 },
        { x: 70, y: 35 }
      ];

      answers.forEach(([key, text], index) => {
        const isCorrect = key === question.correct;
        newFruits.push({
          id: `q${currentQuestionIndex}-${key}`,
          type: isCorrect ? 'correct' : 'wrong',
          answer: key,
          text: text,
          position: positions[index] || { x: 50, y: 50 },
          isSliced: false
        });
      });

      setFruits(newFruits);
    }
  }, [gameState, currentQuestionIndex, allQuestions]);

  const handleFruitClick = (fruit) => {
    if (fruit.isSliced) return;

    // Mark fruit as sliced
    setFruits(prev => prev.map(f => 
      f.id === fruit.id ? { ...f, isSliced: true } : f
    ));

    if (fruit.type === 'correct') {
      // Correct answer
      setScore(prev => prev + currentQuestion.punten);
      
      setAnsweredQuestions(prev => [...prev, {
        question: currentQuestion.vraag,
        userAnswer: fruit.answer,
        correct: true,
        explanation: currentQuestion.toelichting
      }]);

      // Move to next question after 800ms
      setTimeout(() => {
        if (currentQuestionIndex + 1 < allQuestions.length) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          endGame();
        }
      }, 800);
    } else {
      // Wrong answer - lose a life
      const newLives = lives - 1;
      setLives(newLives);

      setAnsweredQuestions(prev => [...prev, {
        question: currentQuestion.vraag,
        userAnswer: fruit.answer,
        correct: false,
        explanation: currentQuestion.toelichting,
        correctAnswer: currentQuestion.correct
      }]);

      if (newLives <= 0) {
        // Game over
        setTimeout(endGame, 800);
      } else {
        // Move to next question after wrong answer
        setTimeout(() => {
          if (currentQuestionIndex + 1 < allQuestions.length) {
            setCurrentQuestionIndex(prev => prev + 1);
          } else {
            endGame();
          }
        }, 800);
      }
    }
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setAnsweredQuestions([]);
    setFruits([]);
  };

  const resetGame = () => {
    setGameState('start');
    setCurrentQuestionIndex(0);
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setAnsweredQuestions([]);
    setFruits([]);
  };

  // START SCREEN
  if (gameState === 'start') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)' }}>
        <nav style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.75rem 1rem' }}>
            <button
              onClick={() => onNavigateTo("home")}
              style={{ padding: '0.5rem 1rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
            >
              ← Terug naar menu
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '1rem' }}>🍎 Data Slice</h1>
              <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>Verwijder slechte data!</p>
            </div>

            <div style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '1.5rem', marginBottom: '1.5rem', borderRadius: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>Hoe werkt het?</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#16a34a', marginRight: '0.5rem', fontSize: '1.25rem' }}>✓</span>
                  <span style={{ color: '#4b5563' }}>Klik op de <strong style={{ color: '#16a34a' }}>groene vruchten (✓)</strong> voor goede antwoorden</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#ef4444', marginRight: '0.5rem', fontSize: '1.25rem' }}>✗</span>
                  <span style={{ color: '#4b5563' }}>Vermijd de <strong style={{ color: '#ef4444' }}>rode vruchten (✗)</strong> met foute antwoorden</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#eab308', marginRight: '0.5rem', fontSize: '1.25rem' }}>⏱</span>
                  <span style={{ color: '#4b5563' }}>Je hebt <strong>60 seconden</strong> en <strong>3 levens</strong></span>
                </li>
                <li style={{ display: 'flex', alignItems: 'start' }}>
                  <span style={{ color: '#3b82f6', marginRight: '0.5rem', fontSize: '1.25rem' }}>📊</span>
                  <span style={{ color: '#4b5563' }}>Er zijn <strong>{allQuestions.length} vragen</strong> over privacy en AVG</span>
                </li>
              </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', border: '2px solid #e5e7eb' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>❓</div>
                <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>{allQuestions.length} Vragen</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Over privacy en AVG</p>
              </div>
              <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', border: '2px solid #e5e7eb' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏱️</div>
                <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>60 Seconden</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tijd om te spelen</p>
              </div>
              <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', border: '2px solid #e5e7eb' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>❤️</div>
                <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>3 Levens</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Let op je fouten!</p>
              </div>
            </div>

            <button
              onClick={startGame}
              style={{ width: '100%', background: '#16a34a', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', border: 'none', fontWeight: 'bold', fontSize: '1.25rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}
            >
              🎮 Start het spel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING SCREEN
  if (gameState === 'playing') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #f3e8ff)' }}>
        <nav style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => onNavigateTo("home")}
              style={{ padding: '0.5rem 1rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
            >
              ← Terug
            </button>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                <span style={{ color: '#6b7280' }}>Score:</span> <span style={{ color: '#16a34a' }}>{score}</span>
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                <span style={{ color: '#6b7280' }}>Levens:</span> <span style={{ color: '#ef4444' }}>{'❤️'.repeat(lives)}</span>
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                <span style={{ color: '#6b7280' }}>Tijd:</span> <span style={{ color: '#3b82f6' }}>{timeLeft}s</span>
              </div>
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
          <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem', maxWidth: '1024px', margin: '0 auto 1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Vraag {currentQuestionIndex + 1} van {allQuestions.length}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              {currentQuestion?.vraag}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Klik op de juiste vrucht! ✓ = Goed, ✗ = Fout
            </p>
          </div>

          <div 
            style={{ 
              position: 'relative', 
              background: 'linear-gradient(to bottom, #e0f2fe, #dcfce7)', 
              borderRadius: '0.75rem', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)', 
              maxWidth: '900px', 
              margin: '0 auto',
              height: '500px',
              overflow: 'hidden'
            }}
          >
            {fruits.map(fruit => (
              <FruitItem
                key={fruit.id}
                type={fruit.type}
                position={fruit.position}
                onClick={() => handleFruitClick(fruit)}
                isSliced={fruit.isSliced}
                answerKey={fruit.answer}
                answerText={fruit.text}
              />
            ))}

            <div style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, padding: '0 1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {currentQuestion && Object.entries(currentQuestion.answers).map(([key, text]) => {
                  const fruit = fruits.find(f => f.answer === key);
                  return (
                    <div
                      key={key}
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'opacity 0.3s',
                        opacity: fruit?.isSliced ? 0.3 : 1,
                        border: '2px solid #e5e7eb'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>{key}</div>
                      <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>{text}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS SCREEN
  if (gameState === 'results') {
    const correctCount = answeredQuestions.filter(q => q.correct).length;
    const wrongCount = answeredQuestions.filter(q => !q.correct).length;

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #faf5ff, #fce7f3)' }}>
        <nav style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.75rem 1rem' }}>
            <button
              onClick={() => onNavigateTo("home")}
              style={{ padding: '0.5rem 1rem', background: '#9333ea', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
            >
              ← Terug naar menu
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '2rem' }}>
            <div style={{ textAlign: 'center', border: '2px dashed #c084fc', borderRadius: '0.5rem', padding: '2rem', background: '#faf5ff', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '0.5rem' }}>🎉 Spel Afgelopen!</h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Goed gedaan! Hier zijn je resultaten:</p>

              <div style={{ fontSize: '4.5rem', fontWeight: 'bold', color: '#9333ea', margin: '2rem 0' }}>{score}</div>
              <div style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem' }}>Totaal Punten</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '2px solid #bbf7d0' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>{correctCount}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Correct</div>
                </div>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '2px solid #fecaca' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{wrongCount}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Fout</div>
                </div>
              </div>
            </div>

            {wrongCount > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>📝 Fouten om van te leren:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {answeredQuestions.filter(q => !q.correct).map((q, index) => (
                    <div key={index} style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '1rem', borderRadius: '0.25rem' }}>
                      <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>{q.question}</p>
                      <p style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '0.5rem' }}>
                        Je antwoord: <strong>{q.userAnswer}</strong> (Fout)
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#16a34a', marginBottom: '0.5rem' }}>
                        Correct antwoord: <strong>{q.correctAnswer}</strong>
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>{q.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={resetGame}
                style={{ flex: 1, background: '#9333ea', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '600', cursor: 'pointer' }}
              >
                🔄 Speel opnieuw
              </button>
              <button
                onClick={() => onNavigateTo("home")}
                style={{ flex: 1, background: '#6b7280', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '600', cursor: 'pointer' }}
              >
                🏠 Terug naar Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}