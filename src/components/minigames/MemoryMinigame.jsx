import { useState } from 'react';

const icons = ['🔒', '📧', '🛡️', '👤', '🔑', '📱'];

const createInitialCards = () => {
  return [...icons, ...icons]
    .sort(() => Math.random() - 0.5)
    .map((icon, index) => ({
      id: index,
      icon,
      flipped: false,
      matched: false,
    }));
};

export default function MemoryMinigame({ onComplete }) {
  const [cards, setCards] = useState(createInitialCards);
  const [flippedCards, setFlippedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleCardClick = (id) => {
    if (flippedCards.length === 2) return;
    if (cards[id].matched || cards[id].flipped) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      
      const [first, second] = newFlipped;
      if (newCards[first].icon === newCards[second].icon) {
        // Match found - create new array with updated matched status
        const updatedCards = newCards.map((card, index) => 
          index === first || index === second 
            ? { ...card, matched: true }
            : card
        );
        setCards(updatedCards);
        setFlippedCards([]);

        // Check if game is complete
        if (newCards.every(card => card.matched)) {
          setIsComplete(true);
          setTimeout(() => {
            onComplete();
          }, 500);
        }
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          const resetCards = newCards.map((card, index) => 
            index === first || index === second 
              ? { ...card, flipped: false }
              : card
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  if (isComplete) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-success mb-2">Gefeliciteerd!</h3>
        <p className="text-muted-foreground mb-4">Je hebt het memory spel voltooid in {moves} zetten!</p>
        <div className="inline-block px-6 py-2 bg-success/10 text-success rounded-full font-semibold border border-success/30">
          Minigame Voltooid! ✓
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-center">
        <p className="text-sm text-muted-foreground">Aantal zetten: <span className="font-bold text-foreground">{moves}</span></p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.matched || card.flipped}
            className={`
              aspect-square rounded-lg text-3xl font-bold transition-all duration-300
              ${card.flipped || card.matched
                ? 'bg-card border-2 border-primary/40'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }
              ${card.matched ? 'opacity-50' : ''}
            `}
          >
            {card.flipped || card.matched ? card.icon : '?'}
          </button>
        ))}
      </div>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        💡 Vind alle paren om te winnen!
      </div>
    </div>
  );
}
