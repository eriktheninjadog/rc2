// This component is an intelligent text field
// It takes an array of tokens plus a trigger function
// produces a div containing spans of these tokens
// calls the function on a click with the function of that tooken

import React, { startTransition, useState } from 'react';

import { callPoeWithCallback, backEndCall,addlookup,createWordList, amazonTranslateFromChinese, dictionaryLookup,addOutputExercise } from "./backendapi/backendcall";


import { Row,Col,Button,Container } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';

import { lookupOTC ,findCharactersWithComponent} from "../datacomponents/OTCLookup";
import { keyboard } from '@testing-library/user-event/dist/keyboard';

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


const checkCharacterDetails = (stringofchars) => {
    let cc = [];
    for (let i =0;i<stringofchars.length;i++) {
        let c = stringofchars[i];
        let looks = lookupOTC(c);
        if (looks != null) {
            
            let ba = Object.keys(looks['components']);
            for (var jj = 0; jj<ba.length;jj++) {
                let comp = ba[jj];
                let partOf = findCharactersWithComponent(comp);
                if (partOf.length > 0) {
                    for(let ii=0;ii<partOf.length;ii++) {
                        cc.push(partOf[ii]);
                    }
                }
            }
        }            
    }
    let thewords = getRandomElementsFromArray(cc,10);
    //callPoe(cwsid,'Write a paragraph of 100-200 words in traditional Chinese that contains all these characters: ' + thewords,'GPT-4', true);
    //handleClose();
}

function getRandomElementsFromArray(arr, count) {
    const shuffled = arr.slice(); // Create a shallow copy of the array
    let currentIndex = shuffled.length;
    const desiredElements = [];
  
    // While there are elements to pick and shuffle
    while (desiredElements.length < count && currentIndex > 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;  
      // Swap the current element with a randomly selected element
      [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];  
      // Add the selected element to the desired elements array
      desiredElements.push(shuffled[currentIndex]);
    }
    return desiredElements;
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


    function extractEnspeak(text) {
        const regex = /<enspeak>([\s\S]*?)<\/enspeak>/g;
        const matches = [];
        let match;
      
        while ((match = regex.exec(text)) !== null) {
          matches.push(match[1]);
        }
      
        return matches;
      }


      function removeTags(text) {
        
        return new Promise((resolve, reject) => {
          try {
            // Regular expression to match any tag
            const tagRegex = /<[^>]+>/g;
            
            // Replace all tags with an empty string
            const result = text.replace(tagRegex, '');
            
            // Resolve the promise with the result
            resolve(result);
          } catch (error) {
            // If any error occurs, reject the promise
            reject(error);
          }
        });
      }
      /*
    function removeTags(text) {
        // Regular expression to match any tag
        const tagRegex = /<[^>]+>/g;
        
        // Replace all tags with an empty string
        return text.replace(tagRegex, '');
      }
    */

    function extractEnglishTranslation(text) {

        if (text.indexOf('</enspeak>')!=-1) {
            text = text.substring(text.indexOf(':') );
            let str = extractEnspeak(text);
            let bridx = str.indexOf('<br/>');
            if (bridx != -1) {
                str = str.substring(bridx)+4;
            }
            //let newstr = removeTags(str);
            return str;
        }
        // Split the text into lines
        const lines = text.split('\n');
        
        // Find the starting index
        let startIndex = lines.findIndex(line => line.trim() === "English translation:");

        if (startIndex === -1) {
            startIndex = lines.findIndex(line => line.trim() === "Translation:");
        }
        
        
        if (startIndex === -1) {
          return ""; // "English translation:" not found
        }
        
        let extractedLines = [];
        let emptyLineCount = 0;
        
        // Start from the line after "English translation:"
        for (let i = startIndex + 2; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line === "") {
            emptyLineCount++;
            if (emptyLineCount === 4) {
              break; // Stop if we've encountered two consecutive empty lines
            }
          } else {
            emptyLineCount = 0; // Reset count if we encounter a non-empty line
            extractedLines.push(line);
          }
        }
        
        return extractedLines.join('\n');
      }
      
      function speakEnglish(text, callback) {
        if ('speechSynthesis' in window) {
          let utterance = new SpeechSynthesisUtterance();
          
          utterance.text = text;
          utterance.lang = 'en-US';
          
          utterance.onend = function(event) {
            console.log('Speech finished successfully');
            if (typeof callback === 'function') {
              callback();
            }
          };
          
          utterance.onerror = function(event) {
            console.error('Speech synthesis error:', event.error);
            if (typeof callback === 'function') {
                alert(event.error);
                callback(event.error);
            }
          };
          
          try {
            window.speechSynthesis.speak(utterance);
          } catch (error) {
            alert(error);
            console.error('Error initiating speech:', error);
            if (typeof callback === 'function') {                
              callback(error);
            }
          }
        } else {
          console.error('Text-to-speech not supported in this browser');
          if (typeof callback === 'function') {
            alert('Text-to-speech not supported');
            callback('Text-to-speech not supported');
          }
        }
      } 
      // Usage
 
    const displayDialog = (headline,content) => {
        setmodalcontent(content);
        modalheading = headline;
        console.log('displayDialog ' + headline + ' ' + content);
        /*
        let sayit = extractEnglishTranslation(content);
        if (sayit !== "")
            speakEnglish(sayit,()=> {
                window.startEvent();
            } ); else {
                console.log('no english found in ' + content );
                window.startEvent();
            }
                */
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
        props.keyhandler(event.key);
    }

    const handleClick = (event) => {
        modalheading = event.target.innerText;
        let word = modalheading;
        navigator.clipboard.writeText(word);
        if (word.length > 10) {
            return;    
        }
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
                        if (value == '~') {
                            window.code = !window.code;
                            return (<span></span>)
                        }
                        if (window.code) {
                            return (<span dangerouslySetInnerHTML={{__html: value}}></span>);
                        }
                        if (value.indexOf('href') !=-1) {
                          return(<span dangerouslySetInnerHTML={{__html: value}}></span>);  
                        }
                        if (value=='\n')
                            return (<a onClick={innerMenu}>*<br></br></a>);
                        else
                            return (<span style={{fontSize:30}} id={"tokenid"+index}>{value}</span>);
                    })
                }
            </div>
            <button onClick={()=>{render(false);}}>render</button>
            <button onClick={()=>{render(true);}}>add to render</button>
            <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
            <Modal.Title dangerouslySetInnerHTML={{__html: makemodalheading(modalheading)}}></Modal.Title>
            </Modal.Header>
            <Modal.Body dangerouslySetInnerHTML={{__html: modalcontent}}></Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Close </Button>
            <a href={"/editdictionary?term="+modalheading}>edit</a>
            <Button variant="secondary" onClick={()=>{addSentenceFromDialog();}}>Add Sent </Button>
            <Button variant="secondary" onClick={()=>{
                let exampleChunk = modalheading;
                const selection = window.getSelection();
                const isEmpty = selection.toString() === '';
                if (!isEmpty) {
                    exampleChunk = selection.toString();                    
                }
                createexamples("Create 3 sentences in C1 level Cantonese containing this chunk:"+exampleChunk + ". Return these together with english translation in json format like this: [{\"english\":ENGLISH_SENTENCE,\"chinese\":CANTONESE_TRANSLATION}].Only respond with the json structure.","A1",result=>{
                let baba = result;                
                let gdb = window.gamedatabase;   
                if (gdb !== undefined ) {
                for(var i =0 ; i < baba.length;i++) {
                    gdb.push( {tokens:baba[i]['chinese'],english:baba[i]['english'] }   )
                    }
                    window.gamedatabase = gdb;
                }

            }); }}>CExample </Button>
            <Button variant="secondary" onClick={()=>{addToExamplesFromDialog(modalheading,modalcontent)}}>addit</Button>            
            </Modal.Footer>
            </Modal>
            </div>
            )
     )     
}

export default IntelligentText;
