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
import FlashcardDeck from "./FlashCardComponent";
import { ConcurrentModificationException } from "@aws-sdk/client-translate";
import { getInterestFromStack } from "./backendapi/remotestack";


const CoachComponent = ()=> {

    const [tokens,setTokens] = useState([]);

    const [currentDeck, setCurrentDeck] = useState([
        { id: 1, front: 'React', back: 'A JavaScript library for building user interfaces' },
        { id: 2, front: 'Component', back: 'Base building block of React applications' },
        { id: 3, front: 'State', back: 'Internal data storage of a component' },
      ]);
    
    
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




function extractChineseSentences(pageContent) {
    return new Promise((resolve, reject) => {
        fetch('https://chinese.eriktamm.com/api/extract_chinese_sentences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ page: pageContent })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            resolve(data.sentences);
        })
        .catch(error => {
            console.error('Error extracting Chinese sentences:', error);
            reject(error);
        });
    });
}
function extractAndParseJson(str) {
    try {
        // Find the first '[' and last ']' positions
        const startBracketIndex = str.indexOf('[');
        const endBracketIndex = str.lastIndexOf(']');
        
        // Return empty array if brackets aren't found
        if (startBracketIndex === -1 || endBracketIndex === -1) {
            return [];
        }
        
        // Extract the substring between the first '[' and last ']', inclusive
        const jsonString = str.substring(startBracketIndex, endBracketIndex + 1);
        
        // Parse the JSON string into an array
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return [];
    }
}


const getWordListAsString = () => {
  const existingListString = localStorage.getItem('wordList');
  if (!existingListString) return '';
  
  // Clean expired words before returning
  const wordList = JSON.parse(existingListString);
  const now = Date.now();
  const THREE_DAYS_MS = 12 * 60 * 60 * 1000;
  const filteredList = wordList.filter(item => {
    return (now - item.timestamp) < THREE_DAYS_MS;
  });
  
  // Update storage with cleaned list
  localStorage.setItem('wordList', JSON.stringify(filteredList));
  
  // Return comma-separated words
  return filteredList.map(item => item.word).join(',');
};



function addToCards() {
    let page = document.body.innerText;
    extractChineseSentences(page).then(sentences => {
        console.log('extracted sentences:', sentences);
        let sentenceArray = extractAndParseJson(sentences);
        let aDeck = []
        sentenceArray.forEach(sentence => {
            console.log('sentence:', sentence);
            aDeck.push({ id: currentDeck.length + 1, back: sentence.chinese, front: sentence.translation });
        });
        setCurrentDeck(aDeck);
    });
}

// Example usage:
// extractChineseSentences("这是一个中文句子。This is an English sentence. 我喜欢学习中文。")
//   .then(sentences => console.log(sentences))
//   .catch(error => console.error(error));

function sendMessage() {
    const input = document.getElementById('input');
    const chat = document.getElementById('chat');
    const english = document.getElementById('englishinput');
    getActivityTimer().heartbeat();
    let text = input.value;
    if (document.getElementById('vocabtype').value.length > 0) {
        text = text + "Vocabulary from  " + document.getElementById('vocabtype').value;
    }

    if (english.value != '') {
        text = "Here is a sentence in English: " + english.value + "\nAnd here is the translation attempt: " + input.value + "\n Suggest suggestions to improve the translation and some possible variations.";
    }
    english.value ='';

    chat.innerHTML += `<div class="message"><b>You:</b> ${text}</div>`;
    
    fetch('https://chinese.eriktamm.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: window.sessionId,
            message: text
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


/*
extract all chinese sentences from this page and return them in a list together with their translations in json format (e.g. [{"chinese": "你好", "translation": "hello"}])
*/

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


const perplexity = () => {
        console.log(document.getElementById('input').value)
        let question = document.getElementById('input').value;
        backEndCall("ai_perplexity",{"question":question},(result)=>{
            setTokens(result);
        },(error)=>{console.log(error)});
    }


function restartTimer() {
    getActivityTimer().start('writing');
    //ActivityTimer().
}

window.restartTimer = restartTimer();

async function fetchWritingTime() {
    try {
        const response = await fetch('https://chinese.eriktamm.com/api/getwritingtime');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        document.getElementById('totalTime').innerText = formatTime(data.totalTime);

        if (getActivityTimer().isPaused ==true ) {
            document.getElementById('dailyTime').innerHTML = '<a href="#" onclick="window.restartTimer();">paused</a>';
            document.getElementById('dailyTime').onclick = getActivityTimer().start('writing');
        }
        else {
            document.getElementById('dailyTime').innerText = formatTime(data.dailyTime);
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


useEffect(() => {
    // Get saved vocabulary types from localStorage
    const savedVocabTypes = JSON.parse(localStorage.getItem('vocabTypes') || '[]');
    
    // Get the select element
    const selectElement = document.getElementById('preselectvocabtype');
    
    // Add saved vocabulary types to the select element
    savedVocabTypes.forEach(vocabType => {
        // Check if this option already exists to avoid duplicates
        if (!Array.from(selectElement.options).some(option => option.value === vocabType)) {
            const option = document.createElement('option');
            option.value = ` ${vocabType} `;
            option.textContent = vocabType;
            selectElement.appendChild(option);
        }
    });
    
    // Add event listener to update textarea when selection changes
    selectElement.addEventListener('change', (e) => {
        const vocabTypeInput = document.getElementById('vocabtype');
        vocabTypeInput.value = e.target.value.trim();
        getActivityTimer().heartbeat();
    });
    
    // Function to save a new vocabulary type
    window.saveVocabType = (vocabType) => {
        if (!vocabType) return;
        
        // Get current saved types
        const savedTypes = JSON.parse(localStorage.getItem('vocabTypes') || '[]');
        
        // Add new type if it doesn't exist already
        if (!savedTypes.includes(vocabType)) {
            savedTypes.push(vocabType);
            localStorage.setItem('vocabTypes', JSON.stringify(savedTypes));
            
            // Add to select element
            const option = document.createElement('option');
            option.value = ` ${vocabType} `;
            option.textContent = vocabType;
            selectElement.appendChild(option);
        }
    };
}, []);

// Add button to save current vocabulary type
const saveCurrentVocabType = () => {
    const vocabType = document.getElementById('vocabtype').value.trim();
    if (vocabType) {
        window.saveVocabType(vocabType);
    }
};


// Function to fetch word orders
function getWordOrders() {
    return fetch('https://chinese.eriktamm.com/api/word_orders', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        return data.result;
    })
    .catch(error => {
        console.error('Error fetching word orders:', error);
        throw error;
    });
}

// Function to add word orders
function addWordOrders(text) {
    return fetch('https://chinese.eriktamm.com/api/add_word_orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        return data.result;
    })
    .catch(error => {
        console.error('Error adding word orders:', error);
        throw error;
    });
}

function getWordOrder() {
    getWordOrders().then(result => {
        console.log('word orders:', result);
        if (result && result.length > 0) {
            // Pick a random element from the result array
            const randomIndex = Math.floor(Math.random() * result.length);
            const randomWordOrder = result[randomIndex];
            
            // Do something with the random word order (e.g., display it)
            console.log('Random word order:', randomWordOrder);
            document.getElementById('input').value = 'lets practice sentences using this word order: ' + randomWordOrder['structure'] 
            + ". Give me a sentence using this structure, give me the english translation and I'll try to translate"
            // You could also update state or the DOM here if needed
        }
    });
}

function addWordOrder() {
    const text = document.body.innerText;
    addWordOrders(text).then(result => {
        console.log('Added word orders:', result);
    }).catch(error => {
        console.error('Error adding word order:', error);
    });
}

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

    useEffect(() => {
        // Fetch total time and daily time from the backend or calculate it
        // For now, we will set it to some dummy values
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
        <br></br><input type='text' id="englishinput" size={38}></input><br></br>
    <textarea id="input" onChange={()=>{getActivityTimer().heartbeat();}} placeholder="Type your message..." cols={40} rows={5}></textarea>
    <button onClick={()=>{sendMessage();}}>Send</button> <button onClick={()=>{perplexity();}}>perplexity</button><button onClick={()=>{ window.pinyinMap = null;  pinyinLookup.loadPinyinData();}}>Load</button>
    <div id="loading-indicator">Loading pinyin data...</div>
    <div>
        <p>Total Writing Time: <div id="totalTime"></div> Daily Writing Time: <div id="dailyTime"></div></p>
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
        <label>Vocabulary:
        <textarea id="vocabtype"></textarea><button onClick={saveCurrentVocabType}>add</button>
        <select id="preselectvocabtype">        
            <option value="">none</option>
            <option value=" ukrainan war ">ukrainan war </option>
            <option value=" democracy and elections ">democracy and elections </option>
            <option value=" asian identity ">asian identity </option>
            <option value=" geometric shapes ">geometric shapes </option>
            <option value=" american politics ">american politics </option>
            <option value=" immigration and emmigration ">immigration and emmigration</option>
            <option value=" deliveries of packages ">deliveries of packages</option>
            <option value=" buying and gettind deliveries on Taobao ">taobao situations</option>
            <option value=" banking situations ">banking situations</option>
            <option value=" software use situations ">software use </option>
            <option value=" study and classroom situations ">study and classroom</option>
            <option value=" stock market situations ">stock market situations </option>
            <option value=" buying clothes situation ">buying clothes</option>
            <option value=" discussing dog training situation ">dog training</option>
            <option value=" military situation ">military situation</option>
        </select>
        </label>
        
        <br></br>
        <Button onClick={()=>{
            console.log(window.lastIntelligentText);
            let text = JSON.parse(localStorage.getItem('intelligentTextTokens'))
            console.log(text);
            let longtext = '';
            for (var i =0;i<text.length;i++) {
                longtext = longtext + text[i];
            }
            document.getElementById("input").value = "Create sentences using vocab and word order from this text: " + longtext;
            }}>I O</Button>

        <Button onClick={()=>{
            let words = getWordListAsString();
            document.getElementById("input").value = "Here is a list of words I want to practice: " + words;
        }}>M O</Button>

        <Button onClick={()=>{
            getWordOrder();
        }}>G O</Button>
        <Button onClick={()=>{
            addWordOrder();
        }}>A O</Button>
        <br></br>
        <Button onClick={()=>{
            addToCards();
        }}>flash</Button>
    
    </Container>
    </div>
    );
}

export default CoachComponent;