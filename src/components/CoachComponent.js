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
import {  getActivityTimer } from "./ActivityTimer";
import { backEndCallGet } from "./backendapi/backendcall";
import './CoachComponent.css';
import { useEffect } from "react";
import StudyGoals from "./backendapi/studygoals";


const CoachComponent = ()=> {

    const [tokens,setTokens] = useState([]);
    
if (window.sessionId == undefined)
    window.sessionId = null;
    
function createSession() {
    fetch('https://chinese.eriktamm.com/api/session', { method: 'POST' })
        .then(r => r.json())
        .then(data => {
            window.sessionId = data.session_id;
            if (getActivityTimer().isRunning() == true) {
              getActivityTimer().pause();
            }
            getActivityTimer().start('writing');
            backEndCallGet("coachfeedback",(result) => {
                window.teachingBackend = result;
            },error=>{console.log(error)});
        });
}

function sendMessage() {
    const input = document.getElementById('input');
    const chat = document.getElementById('chat');
    getActivityTimer().heartbeat();
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

function updateType(type) {
    if (type == "translation")
        document.getElementById("system_prompt").value="You are a Cantonese tutor. You will present a sentence in English B2 level and the user will reply with a translation in Cantonese. You will correct the users response, give suggestions on how to make it more natural and if the user makes mistakes, ask more questions with similar patterns.";
    if (type == "translationadvanced")
        document.getElementById("system_prompt").value="You are a Cantonese tutor. You will present a sentence in English C1 level and the user will reply with a translation in Cantonese. You will correct the users response, give suggestions on how to make it more natural and if the user makes mistakes, ask more questions with similar patterns.";
    if (type == "tutor")
        document.getElementById("system_prompt").value="You are a Cantonese teacher. You will use only simple Cantonese to communicate with the user, using traditional Characters. Correct the user if the make mistakes.You are a Cantonese tutor. You will present a sentence in English B2 level and the user will reply with a translation in Cantonese. You will correct the users response, give suggestions on how to make it more natural and if the user makes mistakes, ask more questions with similar patterns.";
    if (type == "tutorintermediate")
        document.getElementById("system_prompt").value="You are a Cantonese teacher. You will use only intermediate Cantonese to communicate with the user, using traditional Characters. Correct the user if the make mistakes.You are a Cantonese tutor. You will present a sentence in English B2 level and the user will reply with a translation in Cantonese. You will correct the users response, give suggestions on how to make it more natural and if the user makes mistakes, ask more questions with similar patterns.";

    if (type == "tutorbackend")
        document.getElementById("system_prompt").value="You are a Cantonese tutor. You will present a sentence in English the user will reply with a translation in Cantonese. You will correct the users response, give suggestions on how to make it more natural and if the user makes mistakes, ask more questions with similar patterns. Use the material from previous lesson as basis for questions: " + window.teachingBackend;

}

function updateModel(model) {
    getActivityTimer().heartbeat();

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
    getActivityTimer().heartbeat();

    console.log("updating system prompt to: " + prompt);
    fetch('https://chinese.eriktamm.com/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: window.sessionId,
            system_prompt: prompt
        })
    });
}


class PinyinLookup {
    constructor(inputId) {
        this.inputId = inputId;
        this.input = document.getElementById(inputId);
        this.popup = null;
        this.selectedIndex = 0;
        this.pinyinMap = null;
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.init();
    }

    async init() {
        try {
            await this.loadPinyinData();
            this.createPopup();
            this.input = document.getElementById(this.inputId);

            console.log('this.input ' + this.input);

            this.input.addEventListener('input', (e) => this.handleInput(e));
            this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
            this.input.removeAttribute('disabled');
            this.input.placeholder = 'Type pinyin...';
            this.loadingIndicator.style.display = 'none';
        } catch (error) {
            console.error('Failed to load pinyin data:', error);
            this.loadingIndicator.textContent = 'Error loading pinyin data. Please refresh the page.';
        }
    }

    async loadPinyinData() {
        try {
            const response = await fetch('https://chinese.eriktamm.com/api/jyutpingdict');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log('pinyin data loaded' );
            window.pinyinMap = await response.json()
        } catch (error) {
            throw new Error('Failed to load pinyin data: ' + error.message);
        }
    }

    createPopup() {
        this.popup = document.createElement('div');
        this.popup.className = 'pinyin-popup';
        document.body.appendChild(this.popup);
    }

    removeNonAlphaCharacters(str) {
        // Use a regular expression to replace all characters that are not in the range a-z
        return str.replace(/[^a-z]/g, '');
    }
    

    handleInput(event) {
        const currentText = event.target.value;
        if (currentText.indexOf('1') === -1) {
            return;
        }
        console.log('we are handling inputevent');
        //const lastWord = currentText.split(' ').pop().toLowerCase();
        const lastWord = this.removeNonAlphaCharacters(currentText);
        if (!lastWord) {
            this.popup.style.display = 'none';
            return;
        }
        event.target.value=event.target.value.replace('1', '');
        const matches = this.getMatches(lastWord);
        if (matches == null) {
            console.log('matches is null')
        }

        if (matches.length > 0) {
            this.showPopup(matches, event.target);
        } else {
            this.popup.style.display = 'none';
        }
    }

    getMatches(inputStr) {
    if (window.pinyinMap == null) {
        console.log('pinyinMap is null');
        return [];
        }
    console.log('pinyinMap is not null');
    if (window.pinyinMap['result'].hasOwnProperty(inputStr)) {
        return window.pinyinMap['result'][inputStr];
        }
    else {
        return [];
        }
    }

    showPopup(characters, inputElement) {
        getActivityTimer().heartbeat();

        this.popup.innerHTML = '';
        characters.forEach((char, index) => {
            const div = document.createElement('div');
            div.className = 'pinyin-item';
            div.textContent = char;
            div.onclick = () => this.selectCharacter(char, inputElement);
            if (index === this.selectedIndex) {
                div.classList.add('selected');
            }
            this.popup.appendChild(div);
        });

        const rect = inputElement.getBoundingClientRect();
        this.popup.style.display = 'block';
        this.popup.style.top = `${rect.bottom + window.scrollY}px`;
        this.popup.style.left = `${rect.left + window.scrollX}px`;
    }

    removeLowercaseLetters(str) {
        return str.replace(/[a-z]/g, '');
    }

    selectCharacter(character, inputElement) {
        const currentText = inputElement.value;
        inputElement.value = this.removeLowercaseLetters(currentText + character);
        this.popup.style.display = 'none';
        this.selectedIndex = 0;
        inputElement.focus();
    }

    handleKeyDown(event) {
        const items = this.popup.querySelectorAll('.pinyin-item');
        if (items.length === 0) return;

        switch (event.key) {
            case 'ArrowDown':
                this.dontRepeat = false
                this.selectedIndex = (this.selectedIndex + 1) % items.length;
                this.updateSelection();
                event.preventDefault();
                break;
            case 'ArrowUp':
                this.dontRepeat = false
                this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
                this.updateSelection();
                event.preventDefault();
                break;
            /*
            case '1':
                let inputElement = document.getElementById(this.inputId);
                this.popup.style.display = 'none';
                this.selectedIndex = 0;
                inputElement.focus();        
                event.preventDefault();
                break;
              */  
            case 'Enter':
                if (items[this.selectedIndex]) {
                    const selectedChar = items[this.selectedIndex].textContent;
                    this.selectCharacter(selectedChar, this.input);
                    this.dontRepeat = true;
                    this.popup.style.display = 'none';
                    event.preventDefault();
                }
                break;
        }
    }

    updateSelection() {
        const items = this.popup.querySelectorAll('.pinyin-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
}

async function fetchWritingTime() {
    try {
        const response = await fetch('https://chinese.eriktamm.com/api/getwritingtime');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTotalTime(data.totalTime);

        if (getActivityTimer().isPaused ==true ) {
            setDailyTime("paused");    
        }
        else {
            setDailyTime(data.dailyTime);
        }
    } catch (error) {
        console.error('Failed to fetch writing time:', error);
    }
}


useEffect(() => {
    fetchWritingTime();
    const interval = setInterval(fetchWritingTime, 60000); // Fetch every 1 minute

    return () => clearInterval(interval); // Cleanup interval on component unmount
}, []);


function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const pinyinLookup = new PinyinLookup('input');


// Initialize session on page load
if (window.sessionId == null)
    window.sessionId = createSession();   
    const [totalTime, setTotalTime] = useState('00:00');
    const [dailyTime, setDailyTime] = useState('00:00');

    useEffect(() => {
        // Fetch total time and daily time from the backend or calculate it
        // For now, we will set it to some dummy values
        setTotalTime('12:34');
        setDailyTime('01:23');
    }, []);
    
    return (
        <div>
        <Container>
            <Navigation></Navigation>
        <h1>CoachComponent</h1>
        <div id="chat"></div>

        <IntelligentText tokens={tokens} keyhandler={mykeyhandler}></IntelligentText> 
        <button onClick={() => { document.getElementById('input').value = document.getElementById('system_prompt').value; }}>
               Sys-inp
        </button>
        <button onClick={() => { document.getElementById('input').value = ''; }}>clear
            </button>        
        <br></br>
        <textarea id="input" onChange={()=>{getActivityTimer().heartbeat();}} placeholder="Type your message..."></textarea>
    <button onClick={()=>{sendMessage();}}>Send</button><button onClick={()=>{ window.pinyinMap = null;  pinyinLookup.loadPinyinData();}}>Load</button>
    <div id="loading-indicator">Loading pinyin data...</div>
    <div>
        <p>Total Writing Time: {formatTime(totalTime)} Daily Writing Time: {formatTime(dailyTime)}</p>
    </div>
    <div>
        <label>Model: 
        <select id="model" onChange={(event) =>{updateModel(event.target.value);}}>        
        <option value="anthropic/claude-3.5-sonnet">anthropic/claude-3.5-sonnet</option>
        <option value="qwen/qwen-max">qwen/qwen-max</option>
            <option value="deepseek/deepseek-chat">deepseek/deepseek</option>
            <option value="deepseek/deepseek-r1">deepseek/deepseek-r1</option>
            <option value="qwen/qwen-plus">qwen/qwen-plus</option>
            <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
            <option value="google/palm-2">PaLM 2</option>
            <option value="openchat/openchat-7b">OpenChat 7B</option>
        </select>
        </label>
        <label>Type: 
        <select id="type" onChange={(event) =>{updateType(event.target.value);}}>        
            <option value="translation">translation</option>
            <option value="translationadvanced">translationadvanced</option>
            <option value="tutor">tutor</option>
            <option value="tutoradvanced">tutoradvanced</option>
            <option value="tutorbackend">tutorbackend</option>
            <option value="google/palm-2">PaLM 2</option>
            <option value="openchat/openchat-7b">OpenChat 7B</option>
        </select>
        </label>
        
        <label>System Prompt: 
        <textarea type="text" id="system_prompt" onChange={() =>{updateSystemPrompt(document.getElementById('system_prompt').value)}}  
            defaultValue="You are a Cantonese teacher. You will use only simple Cantonese to communicate with the user, using traditional Characters. Correct the user if the make mistakes." style={ {width:"300px"}}></textarea>
        </label>
        </div>
        <br></br>
        <StudyGoals></StudyGoals>
    
    </Container>
    </div>
    );
}

export default CoachComponent;

