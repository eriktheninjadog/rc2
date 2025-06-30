//ChooseYourOwnAdventure.js


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import IntelligentText from './IntelligentText';
import { getActivityTimer } from './ActivityTimer';
import md5 from 'js-md5';


const ChooseYourOwnAdventure = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [story, setStory] = useState(null);
    const [currentNode, setCurrentNode] = useState(null);
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();
    const [tokens, setTokens] = useState([]);
    const [illustration, setIllustration] = useState(null);
    



    const setTokensFromNode = (story,node) => {
        let fineart = [];
        
        fineart = fineart.concat(story['cantonese_title']);
        fineart.push('\n');
        fineart = fineart.concat(node['cantonese_text']);
        fineart.push('\n');
        fineart.push('\n');
        node['choices'].forEach((choice, index) => {
            fineart = fineart.concat(choice['cantonese_text']);
            fineart.push('\n');
        });        
        setTokens(fineart);
    }

    // Load story data when component mounts
    React.useEffect(() => {
        const fetchStory = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('https://chinese.eriktamm.com/api/adventure'); // Example endpoint
                if (!response.ok) {
                    throw new Error('Failed to fetch story');
                }
                let storyData = await response.json();   
                console.log(storyData);             
                storyData = storyData['result'];
                console.log(storyData);
                setStory(storyData);
                setCurrentNode(storyData['startNode']);
                setHistory([storyData['startNode']]);
                
                if (storyData['startNode'].sdd_prompt) { 
                    const hash = md5(storyData['startNode'].sdd_prompt);
                    // Generate and set illustration based on the prompt
                    const promptSignature = ''+hash;
                    setIllustration(`https://chinese.eriktamm.com/adventures/${promptSignature}.jpg`);
                }
                setTokensFromNode(storyData,storyData['startNode']);
                getActivityTimer().changeActivityName('Adventure');
                getActivityTimer().start('Adventure');
            } catch (err) {
                setError(err.message);
            } finally {

                setIsLoading(false);
            }
        };

        fetchStory();
    }, []);

    const handleChoice = (nextNodeId) => {
        getActivityTimer().heartbeat();
        const nextNode = story.nodes.find(node => node.id === nextNodeId);
        if (nextNode==null) {
            alert(`Node with ID ${nextNodeId} not found in story.`);
            return;
        }
        setCurrentNode(nextNode);
        setTokensFromNode(story,nextNode);
        if (nextNode.sdd_prompt) {
            // Create MD5 hash of the prompt string
            const hash = md5(nextNode.sdd_prompt);

            // Generate and set illustration based on the prompt
            const promptSignature = ''+hash;
            setIllustration(`https://chinese.eriktamm.com/adventures/${promptSignature}.jpg`);
        }
        setHistory([...history, nextNode]);
    };

    const handleRestart = () => {
        setCurrentNode(story.startNode);
        setHistory([story.startNode]);
    };

    const handleExit = () => {
        navigate('/'); // Navigate to home page
    };

  window.settokens = (toks) => {
    console.log('settokens');
    setTokens(toks);  
    }


    if (isLoading) return <div className="cyoa-container"><p>Loading adventure...</p></div>;
    if (error) return <div className="cyoa-container"><p>Error: {error}</p></div>;
    if (!story) return null;
    window.currentNode = currentNode;
    return (
        <div className="cyoa-container">
            <h1>{story.title}</h1>
            <img src={illustration} alt={story.title} className="cyoa-image" />
            <IntelligentText tokens={tokens} ></IntelligentText>
            {currentNode && (
                <div className="cyoa-node">
                    <p className="cyoa-text">#</p>
                    
                    {/* Show ending message if this is an end node */}
                    {currentNode.isEnd && (
                        <div className={`cyoa-ending ${currentNode.isSuccess ? 'success' : 'failure'}`}>
                            <h2>{currentNode.isSuccess ? 'Success!' : 'Game Over'}</h2>
                            <p>{currentNode.endingMessage}</p>
                            <button onClick={handleRestart} style={{width: '100%', margin: '5px 0'}}>Play Again</button>
                            <button onClick={handleExit} style={{width: '100%', margin: '5px 0'}}>Exit</button>
                        </div>
                    )}
                    
                    {/* Show choices if not an end node */}

                    {!currentNode.isEnd && currentNode.choices && (
                        <div className="cyoa-choices" style={{width: '100%'}}>
                            {currentNode.choices.map((choice, index) => (
                                <button 
                                    key={index}
                                    className="cyoa-choice" 
                                    style={{width: '100%', margin: '5px 0'}}
                                    onClick={() => handleChoice(choice.nextNodeId)}
                                >
                                    {index}.
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            <div className="cyoa-status">
                <span>Progress: {history.length} steps</span>
            </div>
        </div>
    );
};

export default ChooseYourOwnAdventure;