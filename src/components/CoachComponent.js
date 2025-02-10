import React from "react";
import { UserContext } from "../App";
import Navigation from "./Navigation";
import { Button, Container } from "react-bootstrap";
import { createMockDocument } from "../datacomponents/MockDataProducer";
import {backEndCall,addTextToBackground} from "./backendapi/backendcall";
import { useRef } from "react";
import { useState } from "react";
import IntelligentText from './IntelligentText';
import { tokenizeChineseText } from "./backendapi/tokenizer";
import { tokenizeChinese } from "./backendapi/backendcall";

import { ActivityTimeManager } from "./ActivityManager";
import {  ActivityTimer } from "./ActivityTimer";



const apiManager = new ActivityTimeManager('https://chinese.eriktamm.com/api');

if (window.writingTimer == undefined) {
    window.writingTimer = new ActivityTimer(apiManager, 'Writing');
    // Start timer (starts accumulating time)
}

window.writingTimer.start();

const CoachComponent = ()=> {

    const [tokens,setTokens] = useState([]);
    
if (window.sessionId == undefined)
    window.sessionId = null;
    
function createSession() {
    fetch('https://chinese.eriktamm.com/api/session', { method: 'POST' })
        .then(r => r.json())
        .then(data => window.sessionId = data.session_id);
}

function sendMessage() {
    window.writingTimer.heartbeat();
    const input = document.getElementById('input');
    const chat = document.getElementById('chat');
    
    chat.innerHTML += `<div class="message"><b>You:</b> ${input.value}</div>`;
    
    fetch('https://chinese.eriktamm.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: window.sessionId,
            message: input.value
        })
    })
    .then(r => r.json())
    .then(data => {
        chat.innerHTML += `<div class="message"><b>Assistant:</b> ${data.response}</div>`;
        tokenizeChinese(data.response,(result) => {
            if  (result == null) {
              console.log("No tokens");
              setTokens(["no tokens"]);
            } else {
                setTokens(result);
            }
          });
        chat.scrollTop = chat.scrollHeight;
        input.value = '';
    });
}

function updateModel(model) {
    window.writingTimer.heartbeat();
    console.log("updating model: " + model);
    fetch('https://chinese.eriktamm.com/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: window.sessionId,
            model: model
        })
    });
}

const mykeyhandler = (event) => {}

function updateSystemPrompt(prompt) {
    console.log("updating system prompt to: " + prompt);
    window.writingTimer.heartbeat();

    fetch('https://chinese.eriktamm.com/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: window.sessionId,
            system_prompt: prompt
        })
    });
}

// Initialize session on page load
if (window.sessionId == null)
    window.sessionId = createSession();   


    
    
    return (
        <div>
        <Container>
            <Navigation></Navigation>
        <h1>CoachComponent</h1>
        <div id="chat"></div>
        <IntelligentText tokens={tokens} keyhandler={mykeyhandler}></IntelligentText> 

        <input type="text" id="input" placeholder="Type your message..."></input>
    <button onClick={()=>{sendMessage();}}>Send</button>
    <div>
        <label>Model: 
        <select id="model" onChange={(event) =>{updateModel(event.target.value);}}>        
        <option value="anthropic/claude-3.5-sonnet">anthropic/claude-3.5-sonnet</option>
            <option value="deepseek/deepseek-chat">deepseek/deepseek</option>
            <option value="deepseek/deepseek-r1">deepseek/deepseek-r1</option>
            <option value="qwen/qwen-plus">qwen/qwen-plus</option>
            <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
            <option value="google/palm-2">PaLM 2</option>
            <option value="openchat/openchat-7b">OpenChat 7B</option>
        </select>
        </label>
        
        <label>System Prompt: 
        <textarea type="text" id="system_prompt" onChange={() =>{updateSystemPrompt(document.getElementById('system_prompt').value)}}  
            defaultValue="You are a Cantonese teacher. You will use only simple Cantonese to communicate with the user, using traditional Characters. Correct the user if the make mistakes." style={ {width:"300px"}}></textarea>
        </label>
        </div>
    </Container>
    </div>
    );
}

export default CoachComponent;

