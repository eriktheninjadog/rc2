// This component is an intelligent text field
// It takes an array of tokens plus a trigger function
// produces a div containing spans of these tokens
// calls the function on a click with the function of that tooken

import React, { startTransition, useState } from 'react';
import FloatingButton from './floatingbutton';
import CommandParser from './CommandParser';
import ClozeTest from './ClozeTest';


import { callPoeWithCallback, backEndCall,addlookup,createWordList, amazonTranslateFromChinese, dictionaryLookup,addOutputExercise } from "./backendapi/backendcall";


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
            <FloatingButton 
        onClick={()=> {}} 
        icon="+" 
      />

            <button onClick={()=>{render(false);}}>render</button>
            <button onClick={()=>{render(true);}}>add to render</button>
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
