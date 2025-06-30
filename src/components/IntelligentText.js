// This component is an intelligent text field
// It takes an array of tokens plus a trigger function
// produces a div containing spans of these tokens
// calls the function on a click with the function of that tooken

import React, { startTransition, useState } from 'react';
import FloatingButton from './floatingbutton';
import CommandParser from './CommandParser';
import ClozeTest from './ClozeTest';
import {WordListManager} from './backendapi/WordlistManager'; 

import { tokenizeChinese,callPoeWithCallback, backEndCall,addlookup,createWordList, amazonTranslateFromChinese, dictionaryLookup,addOutputExercise } from "./backendapi/backendcall";


import { Row,Col,Button,Container } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';

import { lookupOTC ,findCharactersWithComponent} from "../datacomponents/OTCLookup";
import { keyboard } from '@testing-library/user-event/dist/keyboard';
import { getActivityTimer } from './ActivityTimer';

let tokens = [ 'a',' ','dog',' ','is',' ','nice']; 

let modalheading = '';
let modalcontent = '';
let cleanmodalheading = '';




const makemodalheading = word => {
    let ret = '';
    for(var i =0;i<word.length;i++) {
        ret = ret + "<a href=\"javascript:window.lookupChar('" + word[i] + "');\">" + word[i] +'</a>'
    }
    return ret;
}


const createexamples = async (question,level,callback    ) => {
  backEndCall("poeexamples",
  {
    level:level,
    number:10,
    onlyFailed:false,
    language: 'spoken vernacular Cantonese',
    store:true,
    question:question
  },
  callback
  ,(error) => {
    console.log(error);
  }
  )
}

// Save a word to localStorage with timestamp
const saveWordToList = (word) => {
  // Get existing list or initialize empty array
  const existingListString = localStorage.getItem('wordList');
  const wordList = existingListString ? JSON.parse(existingListString) : [];
  
  // Clean expired words (older than 72 hours)
  const now = Date.now();
  const THREE_DAYS_MS = 72 * 60 * 60 * 1000;
  const filteredList = wordList.filter(item => {
    return (now - item.timestamp) < THREE_DAYS_MS;
  });
  
  // Add new word if it doesn't exist
  if (!filteredList.some(item => item.word === word)) {
    filteredList.push({
      word: word,
      timestamp: now
    });
  }
  
  // Save updated list
  localStorage.setItem('wordList', JSON.stringify(filteredList));
  return filteredList;
};

// Get comma-separated list of words


const addToExamplesFromDialog = (chinese,english) => {
    let examples = []
    examples.push({'english':english.replaceAll('<br/>','\n'),'chinese':chinese})
    backEndCall('add_examples_to_cache',{
        'examples':examples
        },
        result => {
            alert('done');
        },
        error => {}
        );
}



  /**
   * Makes a GET request to add Jyutping pronunciation for a Chinese character
   * @param {string} character - The Chinese character(s)
   * @param {string} jyutping - The Jyutping pronunciation
   * @returns {Promise} - Promise resolving to the response data
   */
  const addJyutping = (character, jyutping) => {
    return new Promise((resolve, reject) => {
      const encodedCharacter = encodeURIComponent(character);
      const jyutpingClean = jyutping.replace(/[^a-z]/g, '');
      const encodedJyutping = encodeURIComponent(jyutpingClean);
      const url = `https://chinese.eriktamm.com/api/add_jyutping?character=${encodedCharacter}&jyutping=${encodedJyutping}`;      
      fetch(url)
      .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.error('Error adding Jyutping:', error);
        reject(error);
      });
    });
  };




const IntelligentText = (props)=> {


    const [modalcontent,setmodalcontent] = useState('');
    const [show,setShow] = useState(false);
    const [clozeData, setClozeData] = useState(null);


        const magicLookup = async () => {
          let selection = window.getSelection().toString();
          if (selection.length === 0) {
          
            // If no text is selected, try to get text from clipboard
            try {
              const clipboardText = await navigator.clipboard.readText();
              if (clipboardText) {
                // Use the clipboard text as selection
                selection = clipboardText;
              } else {
                // Handle empty clipboard case
                console.log("No text selected and clipboard is empty");
                return;
              }
            } catch (err) {
              console.error("Failed to read clipboard contents: ", err);
              return;
            }
          }
    
    
          callPoeWithCallback(-1,"Explain this sentence,grammar and vocab using English" + ' : ' + selection,'Claude-3-Opus','Claude-3-Opus',result=>{
            console.log(result);
    
            let txt = '';
            let tkns = result[3];
            // set the text to be spoken
              for (var i=0;i< tkns.length;i++) {
                if (tkns[i] == '\n') {
                  txt= txt + '<br/>';
                } else
                  txt = txt + tkns[i];
              }   
            window.displayDialog(selection,txt);
          },
          error=>{
            console.log(error);
          }
          );
        }
    

    const askClaude = (question, onSuccess, onError) => {
      fetch('https://chinese.eriktamm.com/api/ask_claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (onSuccess) onSuccess(data.result);
      })
      .catch(error => {
        console.error('Error asking Claude:', error);
        if (onError) onError(error);
      });
    };

    const askClaudeAndAppend = (question) => {
      askClaude(
        question,
        (result) => {
          appendText(result);
        },
        (error) => {
          console.error('Error asking Claude:', error);
          appendText('Error getting response from Claude.');
        }
      );
    };


    const appendText = (newText) => {
      tokenizeChinese(newText,(result) => {
        if  (result == null) {
          console.log("No tokens");
          //setTokens(["no tokens"]);
        } else {
          appendTokens(result);
        }
      });
    }

    const appendTokens = (newTokens) => {
      if (!Array.isArray(newTokens)) {
        console.error('appendTokens expects an array of strings');
        return;
      }
      
      const updatedTokens = [...props.tokens, ...newTokens];
      window.settokens(updatedTokens);
    };
    
    const innerMenu = (event) => {
        
        let children = Array.from(event.target.parentNode.children);
        let collection = ''; 
        let found = 0;
        for (let i = 0; i<children.length;i++) {
            //betop = betop + children[i].outerHTML;
            if (event.target == children[i] ) {
                found = i;
            }
        }

        // we back backwards
        found--;
        let anothercollection = [];
        while (children[found].outerHTML.indexOf('<br>') == -1) {
            collection = collection + children[found].innerText;
            anothercollection.push(children[found].innerText);
            found--;
        }
        //alert(anothercollection);
        anothercollection.reverse();
        const reversedStr = anothercollection.join('');

        callPoeWithCallback(-1,'Explain this sentence using English : ' + reversedStr,'Claude-3-Opus',false,result=>{

            let txt = '';
            let tkns = result[3];
            // set the text to be spoken
              for (var i=0;i< tkns.length;i++) {
                if (tkns[i] == '\n') {
                  txt= txt + '<br/>';
                } else
                  txt = txt + tkns[i];
              }   
            window.displayDialog(reversedStr,txt);
          },
          error=>{
            console.log(error);
          }
          );
          
    }

    const addSentenceFromDialog =() => {
        let english = window.getSelection().toString();
        let chinese = modalheading;
        addOutputExercise(english,[chinese],'B1',2,1,0,Date.now(), result => {});
    }

    const displayDialog = (headline,content) => {
        setmodalcontent(content);
        modalheading = headline;
        console.log('displayDialog ' + headline + ' ' + content);
        setShow(true);
      };

    let cleanmodalheading ='';

    window.lookupChar = (c) => {
        lookupStuff(c);
    }
    
    const handleClose = () => {
        setShow(false);
    }

    const lookupStuff = (txt) =>  {
        modalheading = txt;
        let word = modalheading;
        navigator.clipboard.writeText(word);

        cleanmodalheading = modalheading;
        dictionaryLookup(modalheading,result => {
            console.log(' ok here we go! ' + word)
            let content = result[0] +  " " + result[1] + " " + result[2] + "<br>";
            window.lastWordChinese = result[0];
            window.lastWordJyutping = result[1];
            addJyutping(result[0],result[1]);
            setmodalcontent(content);
        });
        setShow(true);
    }


    const addToNextAdventure = () => {
      let chinese = window.lastWordChinese;
      let wlm = new WordListManager();
      wlm.addWord('nextadventure',chinese)
        .then(result => {
          console.log('Added to next adventure: ' + chinese);
          alert('Added to next adventure: ' + chinese);
        })
        .catch(error => {
          console.error('Error adding to next adventure:', error);
        });
    }

    const render = (addonly) => {
      let txt ='';
      for (let i=0;i<props.tokens.length;i++) {
        let token = props.tokens[i];
        txt += token;
      }
      if (window.renderBuffer == undefined)
        window.renderBuffer = "";
      window.renderBuffer += txt;
      window.renderBuffer += '\n';      
      if (addonly) {
        alert('in buffer ' + window.renderBuffer);
        return;
      }
      console.log('rendering ' + txt);
      backEndCall("text2mp3",{"text":txt},(result) => {
        window.renderBuffer = '';
      },() => {
        console.log('error');
      });
    }

    const onMyKeyDown = (event) => {
      getActivityTimer().heartbeat();
      props.keyhandler(event.key);
    }

    const cloze = async () => {
      let txt = '';
      for (let i=0;i<props.tokens.length;i++) {
        let token = props.tokens[i];
        if (token == '~') {
          continue;
        }
        if (token == '\n') {
          txt += ' ';
          continue;
        }
        txt += token;
      }
      if (txt.length < 200) { 
        txt = window.srtParser.getAllText();
      }
      console.log('cloze ' + txt);
      backEndCall("generate_cloze",{"text":txt},(result) => {
        console.log('cloze data\n' + result);
        result = result.replaceAll('\'','"');
        let data = JSON.parse(result);
        setClozeData(data);
      }
      ,(error) => {
        console.log('error generating cloze ' + error);
      });
    }

    const handleClick = (event) => {
          
      // Store tokens in localStorage
      localStorage.setItem('intelligentTextTokens', JSON.stringify(props.tokens));
      
      getActivityTimer().heartbeat();
      modalheading = event.target.innerText;
      let word = modalheading;
      navigator.clipboard.writeText(word);
      if (word.length > 10) {
        return;
      }
      saveWordToList(word);
      dictionaryLookup(modalheading,result => {
        console.log(' ok here we go! ' + word)
        let content = result[0] +  " " + result[1] + " " + result[2] + "<br>";
        window.lastWordChinese = result[0];
        window.lastWordJyutping = result[1];
        addJyutping(result[0],result[1]);
        setmodalcontent(content);
      });
      setShow(true);
    }
    window.displayDialog = displayDialog;
    window.code = false;
     return (
        (
            <div onKeyDown={onMyKeyDown}  style={{ outline: 'none' }}    id={"iqtextid"}     tabIndex="0">
                        
            <div onClick={handleClick} id="smarttext" style={{ outline: 'none' }}>
                {
                props.tokens.map(
                    (value,index,array) => {
                        if (Array.isArray(value)) {
                          console.log('array value ' + value);
                            return (<button onClick={()=> value[1]()}>{value[0]}</button>)
                        }
                        
                        if (value.indexOf('href') !=-1) {
                          return(<span dangeroulySetInnerHTML={{__html: value}}></span>);  
                        }
                        if (value=='\n')
                            return (<a onClick={innerMenu}>*<br></br></a>);
                        else
                            return (<span style={{fontSize:30}} id={"tokenid"+index}>{value}</span>);
                    })
                }
            </div>
            <FloatingButton 
        onClick={()=> {}} 
        icon="+" 
      />
            <button onClick={()=>{render(false);}}>render</button>
            <button onClick={()=>{render(true);}}>add to render</button>
            <button onClick={()=>{cloze();}}>cloze</button>
            <div className="ask-claude-container" style={{ marginBottom: '15px' }}>
              <input 
                type="text" 
                id="claude-question"
                placeholder="Ask Claude a question (use # to reference full text)"
                style={{ 
                  width: '80%', 
                  padding: '8px',
                  marginRight: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc' 
                }}
              />
              <button 
                onClick={() => {
                  const inputElem = document.getElementById('claude-question');
                  const question = inputElem.value;
                  
                  if (!question.trim()) return;
                  
                  let fullText = '';
                  for (let i = 0; i < props.tokens.length; i++) {
                    if (props.tokens[i] !== '~' && props.tokens[i] !== '\n') {
                      fullText += props.tokens[i];
                    } else if (props.tokens[i] === '\n') {
                      fullText += ' ';
                    }
                  }
                  
                  const processedQuestion = question.includes('#') 
                    ? question.replace(/#/g, fullText)
                    : question;
                    
                  askClaudeAndAppend(processedQuestion + "\nPlease answer in spoken Cantonese using traditional characters.");
                  inputElem.value = '';
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4285f4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Ask Claude
              </button>
              <select 
                onChange={(e) => {

                  let fullText = '';
                  for (let i = 0; i < props.tokens.length; i++) {
                    if (props.tokens[i] !== '~' && props.tokens[i] !== '\n') {
                      fullText += props.tokens[i];
                    } else if (props.tokens[i] === '\n') {
                      fullText += ' ';
                    }
                  }

                  const index = parseInt(e.target.value);
                  const prompts = [
                    "Translate this text to simple Cantonese,",
                    "Explain this text in Cantonese",
                    "Make a vocab list of important words together with an explanation in simple cantonese and some synonyms. After the wordlist, make a list of questions to make sure that the reader has understood the words",
                    "Create a dialogue based on this text in Cantonese",
                    "Summarize this text in Cantonese",
                    `"Act as a language tutor analyzing the following short text for language learners. Extract and list the most important grammar points (e.g., verb tenses, sentence structures, prepositions, etc.) and key vocabulary (e.g., high-frequency words, challenging terms, or contextually essential phrases) from the text below.
For each grammar point:


Name the structure or rule.
Provide a brief explanation of its use.
Include an example from the text.

For vocabulary:
List the word/phrase, its definition, and part of speech.
Highlight any cultural or contextual nuances if applicable.
Structure your response clearly and concisely, prioritizing elements that are most relevant for learners at a [specify level, e.g., beginner/intermediate] level.

Text: [Insert text here]

Example Response Format:
Grammar Points:

[Structure Name]: [Explanation]. Example: "[Sentence from text]".

...

Key Vocabulary:
[Word/Phrase]: [Part of speech]. [Definition]. Example: "[Sentence from text]".

...

Focus on clarity and usefulness for learners!"
                    
                    `
                  ];
                  
                  if (index >= 0 && index < prompts.length) {
                    askClaudeAndAppend(prompts[index] + "\n" +fullText);
                  }
                }}
                style={{
                  marginLeft: '10px',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="" disabled selected>Quick prompts</option>
                <option value="0">Translate</option>
                <option value="1">Explain</option>
                <option value="2">Wordlist</option>
                <option value="3">Dialogue</option>
                <option value="4">Summarize</option>
                <option value="5">Points</option>
              </select>
            </div>
            
            {clozeData && <ClozeTest data={clozeData} />}


            <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
            <Modal.Title dangerouslySetInnerHTML={{__html: makemodalheading(modalheading)}}></Modal.Title>
            </Modal.Header>
            <Modal.Body dangerouslySetInnerHTML={{__html: modalcontent}}></Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Close </Button>
            <a href={"/editdictionary?term="+modalheading}>edit</a>
            <Button variant="secondary" onClick={()=>{addSentenceFromDialog();}}>Add Sent </Button>
            <Button onClick={() => magicLookup()}>*</Button>
            <Button onClick={() => addToNextAdventure()}>+</Button>

            </Modal.Footer>
            </Modal>
            </div>
            )
     )     
}

export default IntelligentText;
