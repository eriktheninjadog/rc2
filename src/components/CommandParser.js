import React, { useState } from 'react';
import GeneralStack from './GeneralStack';

//CommandParser.js

import { peekInterestFromStack } from './backendapi/remotestack';

import { getInterestFromStack } from './backendapi/remotestack';
import { addInterestToStack } from './backendapi/remotestack';

const CommandParser = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const parseCommand = () => {
        const args = input.trim().split(/\s+/);
        const command = args[0].toLowerCase();
        const params = args.slice(1);
        let stack = new GeneralStack();
        try {
            switch (command) {
                case 'push':
                    if (params.length < 1) {
                        throw new Error('Push command requires at least one argument');
                    }
                    params.forEach(item => addInterestToStack('studylater', item).then(response => {
                        if (response.ok) {
                            console.log('Item pushed to stack:', item);
                        } else {
                            console.error('Failed to push item to stack:', item);
                        }
                    }
                    ))                    
                    setOutput(`Pushed: ${params.join(', ')}`);
                    break;
                case 'pop':

                getInterestFromStack('studylater').then(response => {
                    const item = JSON.stringify(response);
                        setOutput(item);
                        navigator.clipboard.writeText(JSON.stringify(item)).catch(err => {
                                console.error('Failed to copy to clipboard:', err);
                            });                    
                        })             
                break;
                    
                case 'peek':
                    peekInterestFromStack('studylater').then(response => {
                        const item = JSON.stringify(response);
                        setOutput(item);
                        navigator.clipboard.writeText(JSON.stringify(item)).catch(err => {
                                console.error('Failed to copy to clipboard:', err);
                            });                    
                        })             
                        break;
                case 'stacksize':
                    setOutput(`Stack size: ${stack.size()}`);
                    break;
                default:
                    setOutput(`Unknown command: ${command}`);
            }
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        }
        
        setInput('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        parseCommand();
    };

    return (
        <div className="command-parser" id={"commandParser"}>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Enter command (e.g., push 123)"
                />
                <button type="submit">Execute</button>
            </form>
            <div className="output">
                <strong>Output:</strong>
                <pre>{output}</pre>
            </div>
        </div>
    );
};

export default CommandParser;