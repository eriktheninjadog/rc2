import React, { useState, useEffect, useRef } from 'react';
import { getActivityTimer } from './ActivityTimer';
import { Button,Container } from 'react-bootstrap';
import { set } from 'local-storage';
import md5 from 'js-md5';
import { useCallback } from 'react';
import { use } from 'react';


const AudioAdventurePlayer = () => {

    const [currentNode, setCurrentNode] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [story, setStory] = useState(null);
    const [error, setError] = useState(null);
    const [imagefile,setImageFile] = useState(null)
    const [autoplay,setAutoplay] = useState(false)
    
    const audioPlayerRef =useRef(null);

    // Initialize the adventure
    useEffect(() => {
        const fetchStory = async () => {
            try {
                const response = await fetch('https://chinese.eriktamm.com/api/audioadventure'); // Example endpoint
                if (!response.ok) {
                    throw new Error('Failed to fetch story');
                }
                let storyData = await response.json();   
                console.log(storyData);
                storyData = storyData['result'];
                console.log(storyData);
                setStory(storyData);
                setCurrentNode(storyData['startNode']);

                const hash = md5(storyData['startNode'].sdd_prompt);
                                    // Generate and set illustration based on the prompt
                const promptSignature = 'https://chinese.eriktamm.com/adventures/' + hash + '.jpg';
                setImageFile(promptSignature+"")

                //setTokensFromNode(storyData,storyData['startNode']);
                getActivityTimer().changeActivityName('listening');
                getActivityTimer().start('listening');
                console.log("Story loaded:", storyData);
            } catch (err) {
                setError(err.message);
            } finally {
            }
        };

        fetchStory();
    }, []);


    // Play audio for current node description
    const playNodeAudio = (nextNode) => {
        console.log("Playing audio for node:", nextNode);
        if (!currentNode || !currentNode.text_audio) return;
        
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
        }
        
        console.log(`Playing audio for node: ${nextNode.id} - ${nextNode.text} using file: ${nextNode.text_audio}`);
        // Create a new Audio object for the current node's audio
        audioPlayerRef.current.src = `/audioadventures/${nextNode.text_audio}`;
        audioPlayerRef.current.onended = () => {
            if (!currentNode.isEnd) {
                playChoicesAudio(nextNode);
            } else {
                playEndingAudio(nextNode);
            }
        };
        setTimeout(() => {
            audioPlayerRef.current.play();            
        }, 500);
    };

    // Play audio for choices
    const playChoicesAudio = (theNode) => {
        console.log("Playing choices audio for node:", theNode);
        if (theNode.isEnd) {
            playEndingAudio(theNode);
            return; }
        if (!theNode || !theNode.choices || theNode.isEnd) return;
        
        if (theNode.isEnd) {
            playNodeAudio(theNode);
            return;
        }
        const playNextChoice = (index) => {
            if (!theNode || !theNode.choices || index >= theNode.choices.length) 
            {
                if ((autoplay) && !theNode.isEnd) {
                    console.log("No more choices to play, autoplay is enabled, selecting a random choice");
                    // Automatically select a random choice if autoplay is enabled
                    const randomChoiceIndex = getRandomChoice(theNode.choices);
                        if (randomChoiceIndex !== -1) {
                        selectChoice(theNode,randomChoiceIndex);
                    }
                }
                return;
            }
            if (index >= theNode.choices.length) {
                if ((autoplay) && !theNode.isEnd) {
                    // Automatically select a random choice if autoplay is enabled
                    const randomChoiceIndex = getRandomChoice(theNode.choices);
                        if (randomChoiceIndex !== -1) {
                        selectChoice(theNode,randomChoiceIndex);
                    }
                return;
                }
            }

            const choice = theNode.choices[index];
            if (!choice.text_audio) return;
            
            if (choice.text_audio === 'undefined' || choice.text_audio === '') {
                console.warn(`No audio file for choice ${index} in node ${theNode.id}`);
                return;
            }
            audioPlayerRef.current.src = `/audioadventures/${choice.text_audio}`;
            audioPlayerRef.current.onended = () => playNextChoice(index + 1);
            audioPlayerRef.current.play();
        };
        
        playNextChoice(0);
    };

    // Play ending audio
    const playEndingAudio = (nextNode) => {
        if (!nextNode || !nextNode.endingMessage_audio) return;
        
        audioPlayerRef.current.src = `/audioadventures/${nextNode.endingMessage_audio}`;
        audioPlayerRef.current.onended = () => {
            setGameOver(true);
            if (autoplay) {
                // Automatically reset the game if autoplay is enabled
                resetGame();
                setIsPlaying(true);
                setCurrentNode(story['startNode']);
                playNodeAudio(story['startNode']);

            }
        };
        audioPlayerRef.current.play();
    };

    // Handle choice selection
    const selectChoice = (theNode,choiceIndex) => {
        if (!theNode || !theNode.choices || theNode >= theNode.choices.length) return;
        
        const nextNodeId = theNode.choices[choiceIndex].nextNodeId;
        const nextNode = story.nodes.find(node => node.id === nextNodeId);
        

        if (nextNode) {
            console.log(`Moving to node: ${nextNodeId} - ${nextNode.text}`);
            setCurrentNode(nextNode);
            const hash = md5(nextNode.sdd_prompt);
            // Generate and set illustration based on the prompt
            const promptSignature = 'https://chinese.eriktamm.com/adventures/' + hash + '.jpg';
            setImageFile(promptSignature+"")

            // Play the next node after a short delay
            setTimeout(() => {
                playNodeAudio(nextNode);
            }, 500);
        }
    };

    // Start/stop the game
    const toggleGame = () => {
        if (isPlaying) {
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
            }
            setIsListening(false);
        } else {
            if (currentNode) {
                playNodeAudio(currentNode);
            }
        }
        setIsPlaying(!isPlaying);
    };

    // Reset the game
    const resetGame = () => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
        }
        setCurrentNode(story.startNode);
        setGameOver(false);
        setIsPlaying(false);
        setIsListening(false);
    };


    // Helper function to get a random choice
    const getRandomChoice = (choices) => {
        if (!choices || choices.length === 0) return -1;
            return Math.floor(Math.random() * choices.length);
    };

    // Effect to play audio when node changes
    
    useEffect(() => {
        if (isPlaying && currentNode) {
          //  playNodeAudio();
        }
    }, [currentNode]);
    // State for dropdown selection
    const [selectedChoice, setSelectedChoice] = useState('');

    // Handle dropdown change
    const handleDropdownChange = (event) => {
        selectChoice(currentNode,parseInt(event.target.value));
        //setSelectedChoice(event.target.value);
    };

    // Submit the selected choice
    const submitChoice = () => {
        if (selectedChoice !== '') {
            selectChoice(currentNode,parseInt(selectedChoice));
            setSelectedChoice(''); // Reset selection after submitting
        }
    };

    // Render choices for the dropdown
    const renderChoices = () => {
        if (!currentNode || !currentNode.choices || currentNode.choices.length === 0) {
            return null;
        }
        // Display an image for the current node if available
        return (<Container>
                 <div className="node-image">
                <img 
                    src={imagefile}
                    alt={`Scene for ${currentNode.text}`}
                    style={{ maxWidth: '100%', marginBottom: '20px', borderRadius: '8px' }}
                />
              </div>

                    <select 
                        value={selectedChoice}
                        onChange={handleDropdownChange}
                        style={{ padding: '8px', minWidth: '200px' }}
                    >
                        <option value="" disabled>Select an option...</option>
                        {currentNode.choices.map((choice, index) => (
                            <option key={index} value={index}>
                                {choice.text || `Option ${index + 1}`}
                            </option>
                        ))}
                    </select>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={submitChoice}
                        disabled={selectedChoice === ''}
                    >
                        Go
                    </Button>
                    </Container>
        );
    };
    return (
        <div className="audio-adventure">
            <h1>{story?.title || "Audio Adventure"}</h1>
            <audio controls  ref={audioPlayerRef} muted={true}/>
            <div className="controls">
                <button onClick={toggleGame}>
                    {isPlaying ? "Pause Adventure" : "Start Adventure"}
                </button>
                <button onClick={resetGame} disabled={!gameOver}>
                    Restart Adventure
                </button>
                <div className="autoplay-control"></div>
                    <input
                        type="checkbox"
                        id="autoplay-checkbox"
                        checked={autoplay}
                        onChange={(e) => setAutoplay(e.target.checked)}
                    />
                    <label htmlFor="autoplay-checkbox">Auto-play</label>
                    <button onClick={() => alert(currentNode.text)}>
                        show
                    </button>
                </div>
            
            {isListening && (
                <div className="status">
                    <p>Listening... Say a choice number or "repeat room" or "repeat choices"</p>
                    <p>Last heard: {transcript}</p>
                </div>
            )}
            
            {gameOver && (
                <div className="game-over">
                    <p>Adventure Complete!</p>
                </div>
            )}
            {
                renderChoices()
            }
            <Button onClick={()=>{playNodeAudio(currentNode)}}>Repeat description</Button>
            <Button onClick={()=>{playChoicesAudio(currentNode)}}>Repeat Choices</Button>

        </div>
    );
};
export default AudioAdventurePlayer;
