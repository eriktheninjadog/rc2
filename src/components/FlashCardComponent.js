import { useState, useEffect } from 'react';

import { getActivityTimer } from './ActivityTimer';
// Fisher-Yates shuffle algorithm
const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const FlashcardDeck = ({ deck }) => {
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  /*
    Extract Cantonese word order rules from this text, make a list of them with a name and the structure and return in json format:
 Here are all the common Cantonese structures for comparing personal qualities:*
*
1. A + 比 + B + 形容詞*
例: 佢比我高*
(Keoi5 bei2 ngo5 gou1)*
*
2. A + 形容詞 + 過 + B*
例: 佢高過我*
(Keoi5 gou1 gwo3 ngo5)*
*
3. A + 比 + B + 形容詞 + 啲*
例: 佢比我高啲*
(Keoi5 bei2 ngo5 gou1 di1)*
*
4. 同 + B + 比較，A + 形容詞 + 啲*
例: 同我比較，佢高啲*
(Tung4 ngo5 bei2 gaau3, keoi5 gou1 di1)*
*
5. 喺 + A + 同 + B + 之間，A + 形容詞 + 啲*
例: 喺佢同我之間，佢高啲*
(Hai2 keoi5 tung4 ngo5 zi1 gaan1, keoi5 gou1 di1)*
    */

  // Initialize and shuffle cards when deck changes
  useEffect(() => {
    if (deck?.length > 0) {
      setCards(shuffle([...deck]));
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setShowButtons(false);
    }
  }, [deck]);

  const handleCardClick = () => {
    if (!isFlipped && cards.length > 0) {
      setIsFlipped(true);
      setShowButtons(true);
    }
  };

  const handleAnswer = (isCorrect) => {
    getActivityTimer().heartbeat();

    const currentCards = [...cards];
    let newCards = [...currentCards];
    
    if (isCorrect) {
      newCards.splice(currentCardIndex, 1);
    }

    let newIndex = currentCardIndex + 1;
    let needsShuffle = false;

    if (newIndex >= newCards.length) {
      needsShuffle = true;
      newCards = shuffle(newCards);
      newIndex = 0;
    }

    setCards(newCards);
    setCurrentCardIndex(newIndex);
    setIsFlipped(false);
    setShowButtons(false);
  };

  // Don't render anything if no cards remain
  if (!cards?.length) return null;

  const currentCard = cards[currentCardIndex];


  return (
    <div className="flashcard-container">
      <div className="card-count">
        Cards remaining: {cards.length}
      </div>
      <div 
        className={`flashcard ${isFlipped ? 'flipped' : ''}`} 
        onClick={handleCardClick}
      >
        <div className="front">{currentCard.front}</div>
        <div className="back">{currentCard.back}</div>
      </div>

      {showButtons && (
        <div className="buttons">
          <button className="correct-btn" onClick={() => handleAnswer(true)}>I was right</button>
          <button className="incorrect-btn" onClick={() => handleAnswer(false)}>I was wrong</button>
        </div>
      )}
    </div>
  );
};

export default FlashcardDeck;
