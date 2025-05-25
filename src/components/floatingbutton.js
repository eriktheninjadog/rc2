
import React from 'react';
import './floatingbutton.css';
import CommandParser from './CommandParser';
import GeneralStack from './GeneralStack';
import { addInterestToStack } from './backendapi/remotestack';


const FloatingButton = ({ onClick, icon }) => {
  return (
    <div>
      <CommandParser/>
    <button 
      className="floating-button" 
      onClick={
        (e) => {
          if (document.getElementById("commandParser").style.display === "block") {
            document.getElementById("commandParser").style.display = "none"; // Hide command parser
          }
          else {
            // Check if there is text selected
            const selectedText = window.getSelection().toString().trim();
            if (selectedText) {
              // If there is selected text, push it to GeneralStack
              try {
                addInterestToStack('studylater', selectedText).then(response => {
                  if (response.ok) {
                    console.log('Item pushed to stack:', selectedText);
                  } else {
                    console.error('Failed to push item to stack:', selectedText);
                  }
                });
              } catch (error) {
                console.error('Error pushing selected text to GeneralStack:', error);
              }
            } else {
              // If no text is selected, try to get text from clipboard
              navigator.clipboard.readText()
                .then(clipboardText => {
                  if (clipboardText.trim()) {
                    // Push clipboard text to GeneralStack
                    addInterestToStack('studylater', clipboardText.trim())
                      .then(response => {
                        if (response.ok) {
                          console.log('Clipboard item pushed to stack:', clipboardText.trim());
                        } else {
                          console.error('Failed to push clipboard item to stack:', clipboardText.trim());
                        }
                      });
                  }
                })
                .catch(err => {
                  console.error('Failed to read clipboard contents:', err);
                });
            }
            
            document.getElementById("commandParser").style.display = "block"; // Show command parser
          }
          e.stopPropagation(); // Prevent event bubbling
      }
      }>
      {icon}
    </button>
    </div>
  );
};

export default FloatingButton;

