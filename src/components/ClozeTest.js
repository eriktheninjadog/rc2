import React, { useState } from 'react';

import { getActivityTimer } from './ActivityTimer';
import '../App.css'; // Import the CSS file for styling



const ClozeTest = ({ data }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(data.answers.length).fill(''));
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  // Split the text into lines
  const lines = data.text.split(/。|，/).filter((line) => line.trim() !== '' && line.includes('[BLANK_'));
  const totalClozeText = data.text;
  // Function to find a substring and expand until reaching delimiter characters
  const findExpandedContext = (text, substring, delimiterChars = '。，.!?', contextWords = 5) => {
    if (!text || !substring || text.indexOf(substring) === -1) {
      return null;
    }

    const startIndex = text.indexOf(substring);
    const endIndex = startIndex + substring.length;
    
    // Find left boundary
    let leftBoundary = startIndex;
    for (let i = startIndex - 1; i >= 0; i--) {
      if (delimiterChars.includes(text[i])) {
        leftBoundary = i + 1;
        break;
      }
      if (i === 0) {
        leftBoundary = 0;
      }
    }
    
    // Find right boundary
    let rightBoundary = endIndex;
    for (let i = endIndex; i < text.length; i++) {
      if (delimiterChars.includes(text[i])) {
        rightBoundary = i;
        break;
      }
      if (i === text.length - 1) {
        rightBoundary = text.length;
      }
    }
    
    return text.substring(leftBoundary, rightBoundary);
  };


  // Handle input change for the current line
  const handleInputChange = (e) => {
    getActivityTimer().heartbeat();
    
    const answersCopy = [...userAnswers];
    answersCopy[currentLineIndex] = e.target.value;
    setUserAnswers(answersCopy);
  };

  // Handle submission of the current line
  const handleSubmit = () => {
    getActivityTimer().heartbeat();
    
    const currentAnswer = userAnswers[currentLineIndex];
    const correctAnswer = data.answers[currentLineIndex];

    window.correctAnswer = correctAnswer; // For debugging purposes
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
  let currentLine = lines[currentLineIndex];
  currentLine = findExpandedContext(totalClozeText, currentLine, '。.!?');
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
        <div>
          {window.correctAnswer}
        <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          {isCorrect ? '✅ Correct!' : '❌ Incorrect. Try again!'}
        </div>
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
