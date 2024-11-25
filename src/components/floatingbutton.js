
import React from 'react';
import './floatingbutton.css';

const FloatingButton = ({ onClick, icon }) => {
  return (
    <button 
      className="floating-button" 
      onClick={onClick}
    >
      {icon}
    </button>
  );
};

export default FloatingButton;

