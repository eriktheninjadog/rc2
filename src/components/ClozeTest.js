import React, { useState } from 'react';

const ClozeTest = ({ data }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(data.answers.length).fill(''));
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  // Split the text into lines
  const lines = data.text.split('\n').filter((line) => line.trim() !== '');

  // Handle input change for the current line
  const handleInputChange = (e) => {
    const answersCopy = [...userAnswers];
    answersCopy[currentLineIndex] = e.target.value;
    setUserAnswers(answersCopy);
  };

  // Handle submission of the current line
  const handleSubmit = () => {
    const currentAnswer = userAnswers[currentLineIndex];
    const correctAnswer = data.answers[currentLineIndex];

    if (currentAnswer === correctAnswer) {
      setIsCorrect(true);
      setShowFeedback(true);

      // Move to the next line if not the last line
      if (currentLineIndex < lines.length - 1) {
        setTimeout(() => {
          setCurrentLineIndex(currentLineIndex + 1);
        }, 1000);
      } else {
        // All lines done
        setShowCompletionMessage(true);
      }
    } else {
      setIsCorrect(false);
      setShowFeedback(true);
    }
  };

  // Generate JSX for the current line
  const currentLine = lines[currentLineIndex];
  const lineParts = currentLine.split(/(\[BLANK_\d+\])/);
  const lineJSX = lineParts.map((part, index) => {
    if (part.startsWith('[BLANK_')) {
      return (
        <input
          key={index}
          type="text"
          value={userAnswers[currentLineIndex]} // Use current line's answer
          onChange={handleInputChange}
        />
      );
    }
    return <span key={index}>{part}</span>;
  });

  return (
    <div className="cloze-test">
      <h1>{data.title}</h1>
      <p>{data.instructions}</p>

      <div className="text-container">
        {lineJSX}
      </div>

      <button
        onClick={handleSubmit}
        className="submit-button"
      >
        Submit
      </button>

      {showFeedback && (
        <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          {isCorrect ? '✅ Correct!' : '❌ Incorrect. Try again!'}
        </div>
      )}

      {showCompletionMessage && (
        <div className="completion-message">
          <p>🎉 All answers are correct! You've completed the test.</p>
        </div>
      )}
    </div>
  );
};

export default ClozeTest;
