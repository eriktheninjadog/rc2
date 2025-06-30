// src/FlashcardGame.js
import React, { useState, useEffect } from 'react';
import md5 from 'js-md5';
import './FlashcardGame.css'; // We'll create this file for styling




const FlashcardGame = () => {
    // State to hold the cards that haven't been guessed yet
    const [remainingCards, setRemainingCards] = useState([]);
    // State for the card currently being displayed
    const [currentCard, setCurrentCard] = useState(null);
    // State for the user's input
    const [userGuess, setUserGuess] = useState('');
    // State to control whether the hint (sentence) is shown
    const [showHint, setShowHint] = useState(false);
    // State to provide feedback to the user
    const [feedback, setFeedback] = useState('');
    // State to track loading status
    const [loading, setLoading] = useState(true);
    // State to track any errors
    const [error, setError] = useState(null);

    // This effect runs once when the component mounts to fetch data and set up the game
    useEffect(() => {
        const fetchFlashcardData = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://chinese.eriktamm.com/api/flashcards'); // Adjust the API endpoint as needed
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const flashcardData = await response.json();
                
                // A function to shuffle the cards randomly
                const shuffled = [...flashcardData].sort(() => 0.5 - Math.random());
                setRemainingCards(shuffled);
                pickNewCard(shuffled);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching flashcard data:', error);
                setError('Failed to load flashcards. Please try again later.');
                setLoading(false);
            }
        };

        fetchFlashcardData();
    }, []);

    // Function to pick a new card from the remaining deck
    const pickNewCard = (cards) => {
        if (cards.length > 0) {
            setCurrentCard(cards[0]); // Pick the first card of the shuffled deck
        } else {
            // No cards left, game is over
            setCurrentCard(null);
        }
    };

    const handleInputChange = (event) => {
        setUserGuess(event.target.value);
        // Hide feedback and hint when user starts typing again
        if (feedback) setFeedback('');
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent form from reloading the page
        if (!userGuess.trim() || !currentCard) return;

        // Check if the user's guess is correct
        if (userGuess.trim() === currentCard.word) {
            // CORRECT GUESS
            setFeedback('Correct! 🎉');
            
            // Remove the guessed card from the deck
            const newRemainingCards = remainingCards.slice(1);
            setRemainingCards(newRemainingCards);
            
            // After a short delay, pick the next card
            setTimeout(() => {
                pickNewCard(newRemainingCards);
                setUserGuess(''); // Clear the input field
                setShowHint(false); // Hide the hint for the new card
                setFeedback(''); // Clear the feedback
            }, 1500);

        } else {
            // INCORRECT GUESS
            setFeedback('Not quite, try again! Here is a hint.');
            setShowHint(true); // Show the sentence as a hint
        }
    };

    // If there's an error, show the error message
    if (error) {
        return <div className="flashcard-container"><h2>{error}</h2></div>;
    }

    // If still loading, show a loading message
    if (loading) {
        return <div className="flashcard-container"><h2>Loading cards...</h2></div>;
    }

    // If there are no cards left, show a completion message
    if (remainingCards.length === 0 && !currentCard) {
        return <div className="flashcard-container"><h2>Congratulations! You've completed all the flashcards!</h2></div>;
    }
    
    // If the card is loading, show a loading message
    if (!currentCard) {
        return <div className="flashcard-container"><h2>Loading cards...</h2></div>;
    }

    // Generate the image path using the MD5 hash of the prompt
    const imagePath = `https://chinese.eriktamm.com/adventures/${md5(currentCard.prompt).toString()}.jps`;

    return (
        <div className="flashcard-container">
            <h2>Guess the Cantonese Word</h2>
            <p>Cards remaining: {remainingCards.length}</p>

            <div className="image-container">
                <img src={imagePath} alt={`Visual hint for the word`} onError={(e) => { e.target.onerror = null; e.target.src="/images/placeholder.png" }} />
            </div>

            <form onSubmit={handleSubmit} className="guess-form">
                <input
                    type="text"
                    value={userGuess}
                    onChange={handleInputChange}
                    placeholder="Type your answer..."
                    autoFocus
                    disabled={feedback === 'Correct! 🎉'} // Disable input after correct guess
                />
                <button type="submit" disabled={feedback === 'Correct! 🎉'}>Check</button>
            </form>

            {feedback && <p className={`feedback ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>{feedback}</p>}
            
            {showHint && (
                <div className="hint-container">
                    <h4>Hint Sentence:</h4>
                    <p>"{currentCard.sentence}"</p>
                </div>
            )}
        </div>
    );
}

export default FlashcardGame;
