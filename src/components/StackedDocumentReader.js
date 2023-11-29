import React, { useState,useEffect, useRef } from "react";

import Pagination from 'react-bootstrap/Pagination';
import Navigation from "./Navigation";
import { Row,Col,Button,Container } from "react-bootstrap";
import { UserContext } from "../App";
import { callPoe,testUnderstandingBackend, testVocabBackend, getnewsBackend,grammarBackend, getMemoryDevice,updateCws,getCharacterCWS, directAIQuestionsBackend   ,classify,lookuphistory,addlookup,createWordList,fakeWiki,extensibleApplyAI,extensibleSimplify,retrieveValueFromServer,storeValueOnServer,directAIQuestionBackend, explainParagraph,getTestQuestion, amazonTranslateFromChinese, dictionaryLookup,directAIAnalyze,directAIAnalyzeGrammar,directAISummarize,directAISimplify,localLookup, addQuestions, lookUpPosition } from "./backendapi/backendcall";
import { getFailedCards,saveCardsToStorage,clearAllCards, addWordIfNotExist, sizeOfDeck} from "./backendapi/flashcardengine" 
import { getTotalReadCharacter,addCharactersToWork,clearTotalWorkTime,getTotalWorkTime,addToWorkTime } from "./backendapi/workcounter";

import { addReminderItem,getReminderItems } from "../datacomponents/ReminderQueue";
import Select from 'react-select'
import { MultiSelect } from "react-multi-select-component";

import { EventType, publishReaderClickedTerm } from "./eventsystem/Event";
import { registerEventListener } from "./eventsystem/EventMarket";

import Overlay from "react-overlay-component";

import { add_timed_event } from "./timedfunctions";


import { lightColors, darkColors,Container as FloatContainer, Button as FloatButton, Link as FloatLink} from 'react-floating-action-button'

import Modal from 'react-bootstrap/Modal';

const StackedDocumentReader = ()=> {

    const [show, setShow] = useState(false);

    const [knownChars, setknownChars] = useState([]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    const [selected, setSelected] = useState([]);

  
    let items = [];
    let cwsid = -1; 
    let idcounter = 0;

    const [activePage,setActivePage] = useState(0);
    const [storedPosition,setStoredPosition]  = useState({});
    const [lastElementId,setlastElementId] = useState(0);
    const [lastLastElementId,setlastLastElementId] = useState(0);
    
    const [modalcontent,setmodalcontent] = useState();
    const [modalheading,setmodalheading] = useState();

    const [readingTime,setReadingTime] = useState(0);

    const value = React.useContext(UserContext);
    let docreader = value.documentStack.visibleDocument(value.documentStack.depth());
    console.log(docreader);
    const [stackDepth,setStackDepth] = useState(0);
    const [isOpen, setOverlay] = useState(false);


    const editArea = useRef();

    const closeOverlay = () => {
        setOverlay(false);
    }

    const openOverlay = () => {
        addToWork();
        let g = storedPosition;
        g[cwsid] = window.pageYOffset;
        setStoredPosition(g);
        setOverlay(true);
        document.getElementById('aifield').value = '';
    }

    const setPage = idx => {
        addToWork();
        docreader.setPage(idx);
        setActivePage(idx);
    }

    const addToWork = () => {
        addToWorkTime();
        setReadingTime( getTotalWorkTime() );
    }

    const initListeners = () => {
        registerEventListener("dictionarylookupfromregister",
        ev => {
            return ev.type == EventType.ReaderClickTerm;
        },
        ev => {
            let word = ev.data;
            setmodalheading(word);
            dictionaryLookup(word,result => {
                setmodalcontent(result[0] +  " " + result[1] + " " + result[2]);
            });
            handleShow();
        }
         );
         registerEventListener("stacklistener",
         ev => {
            return ev.type == EventType.CWSStackChanged;
         },
         ()=> {
            setActivePage(0);
            setStackDepth(value.documentStack.depth());
         }
         );
         
    }

    const simpleLookup = (event) => {

        if (event.target.id == "") {
            restorePosition();
            return;
        }
        
        if (event.target.id == lastElementId) {
            return;
        }
        
        if (lastLastElementId != 0) {
            if (document.getElementById(lastLastElementId) != null) 
                document.getElementById(lastLastElementId).style.backgroundColor = "#FFFFFF";
        }

        if (parseInt(event.target.id) > window.furthestRead  ) {
            addCharactersToWork(parseInt(event.target.id) - window.furthestRead );
            storeValueOnServer('bookmarks','furthest_read'+cwsid,parseInt(event.target.id));
        }

        if (lastElementId != 0) {
            if (document.getElementById(lastElementId) != null) 
                document.getElementById(lastElementId).style.backgroundColor = "#DDDDFF";
        }

        event.target.style.backgroundColor = "#DDDDDD"
        let g = storedPosition;
        localStorage.setItem('bookmark'+cwsid, event.target.id);

        g[cwsid] = window.pageYOffset;
        setStoredPosition(g);


        let word =event.target.innerText;
        window.lastLookup = word;
        if (word.length > 10) {
            return;
        }
        
        if (word.length > 0 && word != '。' &&  word != ',' && word != '」' && word != '」' && word != '？') {
            addlookup(cwsid,word);
            addReminderItem(word);
        } else {
            return;
        }
        publishReaderClickedTerm(word);
        addToWork();
        setlastElementId(event.target.id);
    }

    const pop = () => {
        addToWorkTime();
        value.documentStack.pop();
        if (stackDepth != value.documentStack.depth()) {
            setStackDepth(value.documentStack.depth());
        }
    }

    const restorePosition = () => {
        retrieveValueFromServer('bookmarks','furthest_read'+cwsid, furthestRead => {
            document.documentElement.style.setProperty('--reading-font-size', '20px');

            if (furthestRead == null) {
                window.furthestRead = 0;
            } else {
                window.furthestRead = furthestRead;
                document.getElementById(''+furthestRead).style.background = '#9999FF';  
                document.getElementById(''+furthestRead).scrollIntoView();
            }
        });        
    }

    let text ='';
    let cwstext = [];
    let cwstitle = '';

    if (docreader != null) {
        let active = docreader.visiblePageNr();
        if (stackDepth != value.documentStack.depth()) {
            setStackDepth(value.documentStack.depth());
        }
        for (let number = 0; number < docreader.nrOfPages(); number++) {
        items.push(
            <Pagination.Item key={number} active={number === active} onClick={()=>{setPage(number);}}>
            {number}
            </Pagination.Item>
        );
        }

        text = docreader.getPage().getContent();  
        cwsid = docreader.getPage().getCwsId();
        cwstext =docreader.getPage().cwstext;
        cwstitle = docreader.getPage().title;
        
        retrieveValueFromServer('bookmarks','furthest_read'+cwsid, furthestRead => {
            if (furthestRead == null) {
                window.furthestRead = 0;
                editArea.current.value = text;

            } else {
                window.furthestRead = furthestRead;
                document.getElementById(''+furthestRead).style.background = '#9999FF'
                editArea.current.value = text;
            }
        });
        addToWorkTime();
    }

    const returnClassName = char => {

        if (window.classify != undefined) {
            if (window.classify.hasOwnProperty(char)) {
                console.log('found');
                return "Appname";
            }
            else {
                console.log('not found');
                
            }
        }
        
        if (window.known == undefined) {
            return "App";
        }
        
        if (window.known.includes(char)) {
            console.log("known " + char);
            return "Appknown";
        }

        return "App";
    }

    let boldState = false;
    let totalOrgLength = 0;

    const mapHTMLToCharacter= (c,index) => {
        idcounter++;
        if (c == '_')  {
            boldState = true;
            return;
        }
        if (c == '\n') {
            return (<br id={index}></br>)
        }
        if (c == ' ') {
            return (<span id={index}>&nbsp;</span>)
        }
        idcounter += c.length - 1;
        if (idcounter > totalOrgLength)
            totalOrgLength = idcounter;
        if (boldState == false)
            return (<span orgidx={idcounter}  id={index} className={ returnClassName(c)} > {c}</span>);
            else {
                boldState = false;
                return (<span orgidx={idcounter}  id={index} className="Appname" >{c}</span>);
            }
    }

    const incFont = () => {
        const fontSize = getComputedStyle(document.documentElement).getPropertyValue('--reading-font-size');
        console.log(fontSize);
        if (fontSize === '14px')
            document.documentElement.style.setProperty('--reading-font-size', '20px');
            else
            if (fontSize === '20px')
                document.documentElement.style.setProperty('--reading-font-size', '24px');
            else
                document.documentElement.style.setProperty('--reading-font-size', '20px');
    }

    const decFont = () => {
        const fontSize = getComputedStyle(document.documentElement).getPropertyValue('--reading-font-size');
        document.documentElement.style.setProperty('--reading-font-size', '14px');
    }

    const testQuestion = () => {
        addToWorkTime();
        getTestQuestion(
            data => {
                    value.documentStack.addSingleCwsAsDocument(data);
                    setActivePage(0);
                    setStackDepth(value.documentStack.depth());
                });
    }

    const checkCharacterDetails = (stringofchars) => {
        for (let i=0;i<stringofchars.length;i++) {
            getCharacterCWS( stringofchars[i],
            data => {
                    value.documentStack.addSingleCwsAsDocument(data);
                    setActivePage(0);
                    setStackDepth(value.documentStack.depth());
                });
            }
    }

    const news = async () => {
        getnewsBackend(cws=> {
            value.documentStack.addSingleCwsAsDocument(cws);
            setActivePage(0);
            setStackDepth(value.documentStack.depth());
        });
        closeOverlay();
    }

    const testVocab = async () => {
        let end = parseInt(lastElementId);
        let start = parseInt(lastLastElementId);
        if (end < start) {
            var tmp = lastElementId;
            lastElementId = lastLastElementId;
            lastLastElementId = tmp;
        }
        let orgStart = parseInt(document.getElementById(lastLastElementId ).getAttribute('orgidx'));
        orgStart -= document.getElementById(lastLastElementId ).innerText.length;
        let orgEnd = document.getElementById(lastElementId).getAttribute('orgidx');   

        testVocabBackend(cwsid,orgStart,parseInt(orgEnd), cws => {
            value.documentStack.addSingleCwsAsDocument(cws);
            setActivePage(0);
            setStackDepth(value.documentStack.depth());
        });
        closeOverlay();
    }

    const testUnderstanding = async () => {
        let end = parseInt(lastElementId);
        let start = parseInt(lastLastElementId);
        if (end < start) {
            var tmp = lastElementId;
            lastElementId = lastLastElementId;
            lastLastElementId = tmp;
        }
        let orgStart = parseInt(document.getElementById(lastLastElementId ).getAttribute('orgidx'));
        orgStart -= document.getElementById(lastLastElementId ).innerText.length;
        let orgEnd = document.getElementById(lastElementId).getAttribute('orgidx');   

        testUnderstandingBackend(cwsid,orgStart,parseInt(orgEnd), cws => {
            value.documentStack.addSingleCwsAsDocument(cws);
            setActivePage(0);
            setStackDepth(value.documentStack.depth());
        });
        closeOverlay();
    }

    const testFuture  = async () => {
        let orgStart = parseInt(document.getElementById(lastElementId).getAttribute('orgidx'));   
        let orgEnd = orgStart + 500;
        if (orgEnd >= totalOrgLength)
            orgEnd = totalOrgLength;
        alert(orgStart + ' ' + orgEnd)
        testUnderstandingBackend(cwsid,orgStart,parseInt(orgEnd), cws => {
            value.documentStack.addSingleCwsAsDocument(cws);
            setActivePage(0);
            setStackDepth(value.documentStack.depth());
        });
        testVocabBackend(cwsid,orgStart,parseInt(orgEnd), cws => {
            value.documentStack.addSingleCwsAsDocument(cws);
            setActivePage(0);
            setStackDepth(value.documentStack.depth());
        });
        closeOverlay();
    }

    const translate = async () => {
        let end = parseInt(lastElementId);
        let start = parseInt(lastLastElementId);
        let txt = '';
        while (start < end) {
            txt = txt + cwstext[start];
            start++;
        }
        amazonTranslateFromChinese(txt, 
            translated => {
                alert(translated);
            }
            );            
    }

    const explainPara = async () => {
        let end = parseInt(lastElementId);
        let start = parseInt(lastLastElementId);
        let txt = '';
        while (start < end) {
            txt = txt + cwstext[start];
            start++;
        }
        explainParagraph(cwsid,txt);
    }

    const wordlist = async () => {
        createWordList(cwsid,result => {
            alert('wordlist ready');
        });
    }

    const esimple = async () => {
        alert('Esimple are you sure?');
        extensibleSimplify(cwsid, result => {console.log(result)});
    }

    const eApplyAI= async (aitext)  => {
        alert('EApply are you sure?');
        extensibleApplyAI(cwsid,aitext,result => {console.log(result)} )
    }

    const readability = async () => {
        lookuphistory(cwsid,
            result => {
                alert( '' + (1.0 - (result.length/cwstext.length))   );
                window.known = result;
        });
    }

    const markread = async () => {
        lookuphistory(-1,
            result => {
                alert( '' + (1.0 - (result.length/cwstext.length))   );
                window.known = result;
        });
    }

    const editText = async () => {
        updateCws(cwsid,editArea.current.value,
            data => {
                console.log(data);
            }
            );
    }

    const memoryDevice = async () => {
        getMemoryDevice(cwstitle,
            data => {
                editArea.current.value  = data + '\n' + editArea.current.value;
            }
            );
    }

    const configs = {
        animate: false
    };
    
    const expandMacros = (text) => {
        let terminators = ['.' ,'？', '\n','「','。','」','「'];

        if (window.lastLookup === undefined)
            return text;
        text = text.replace('xx',window.lastLookup);

        let mid = parseInt(lastElementId);
        let start = mid - 100;
        if (start < 0 )
            start = 0;
        let end = mid+100;
        if (end > cwstext.length)
            end = cwstext.length;
        let worktxt = '';
        while (start < end) {
            worktxt = worktxt + cwstext[start];
            start++;
        }
        text = text.replace('yy',worktxt);
        mid = parseInt(lastElementId);
        start =mid;
        while ( start > 0 && !(terminators.includes(cwstext[start]) )) {
            start--;            
        }
        end = mid;
        while ( end < cwstext.length && !(terminators.includes(cwstext[end]) )) {
            end++;
        }
        worktxt = '';
        while (start < end) {
            worktxt = worktxt + cwstext[start];
            start++;
        }        
        text = text.replace('sss',worktxt);
        mid = parseInt(lastElementId);
        start =mid;
        while ( start > 0 && (cwstext[start] != "\n")) {
            start--;            
        }
        end = mid;
        while ( end < cwstext.length && (cwstext[end]!="\n" )) {
            end++;
        }
        worktxt = '';
        while (start < end) {
            worktxt = worktxt + cwstext[start];
            start++;
        }        
        text = text.replace('ppp',worktxt);
        worktxt = '';
        start = 0;
        end = cwstext.length;
        while (start < (end-1)) {
            worktxt = worktxt + cwstext[start];
            start++;
        }
        text = text.replace('aaa',worktxt);         
        return text;
    }

    const copy = ()=> {
        let end = parseInt(lastElementId);
        let start = parseInt(lastLastElementId);
        let txt = '';
        while (start < end) {
            txt = txt + cwstext[start];
            start++;
        }
        navigator.clipboard.writeText(txt);
    }

    const remindMe = () => {
        let post = "Write a short story in traditional Chinese. The story should containing the following words:\n"
        if (Math.random() > 0.5)
            post = "Write a news article in traditional Chinese. The article should containing the following words:\n"
        let items =getReminderItems();
        for (var i = 0;i < items.length;i++) {
            post = post + ' ' + items[i];
        }
        callPoe(cwsid,post,document.getElementById('bot').value, false);
        closeOverlay();
    }


    const options = [
        { value:0,label:'Role: Chinese coach'},
        { value:1,label:'Role: Cantonese coach'},
        { value:2,label:'Role: Grammar coach'},
        { value:3,label:'Examples'},
        { value:4,label:'alternatives'},
        { value:5,label:'How do I say'},
        { value:6,label:'Grammar'},
        { value:7,label:'Explain this text'},
        { value:8,label:'Vocabulary'},
        { value:9,label:'Diff Vocabulary'},
        { value:10,label:'Summary'},
        { value:11,label:'Simplify'},
        { value:12,label:'xx'},
        { value:13,label:'yy'},
        { value:14,label:'sss'},
        { value:15,label:'ppp'},
        { value:16,label:'aaa'}
    ]

    const _templates =
        [
            "Role: You are a chinese language teacher teaching foreigners. ", //0
            "Role: You are a cantonese language coach. Use traditional chinese and jyutping in your answers. ",
            "Role: You are a chinese language coach with focus on grammar. Use traditional chinese with simple words in your answer. ",
            " Give examples on how to use ",
            " Give alternatives on how to say ",
            " How do I say this in Chinese: ",//5
            " Explain the grammatical constructs used in this Chinese text to an English speaker. Go into depth of each grammatical construct: ",
            " Explain this text using Chinese ",
            " Make a vocabulary list ",//8
            " Make a list of the more difficult vocabulary in this text and provide an example + alternative for each item. This is the text: ",
            " Summarize this to 100 words using traditional Chinese. This is the text: ",
            " Simplify this text using shorter sentences and simpler words, use traditional Chinese: ", //11
            "xx", //12
            "yy", //13
            "sss", //14
            "ppp", //15
            "aaa" //16
        ];

        initListeners();

    return (
        <div>
        <Overlay configs={configs} isOpen={isOpen} closeOverlay={closeOverlay}>
            {cwstitle}
            <br></br>
            {readingTime}/{getTotalReadCharacter()}<button onClick={clearTotalWorkTime}>res</button>{((getTotalReadCharacter()/readingTime)*1.6)*60}
            <br></br>
            <button onClick={copy}>Copy</button>
            <button onClick={incFont}>+</button><button onClick={decFont}>-</button>
            <button onClick={restorePosition}>r</button>
            <button onClick={translate}>Tran</button>               
            <button onClick={getFailedCards}>Hard</button>             
            <br></br>
            <button onClick={clearAllCards}>clr F</button> 
            <button onClick={testQuestion}>Test</button> 
            <button onClick={explainPara}>Explain</button>
            <button onClick={esimple}>ESimple</button>
            <button onClick={wordlist}>Wordlist</button>             
            <br></br>
            <button onClick={readability}>Read %</button>
            <button onClick={markread}>markread</button>
            <button onClick={remindMe}>remindMe</button>
            <button onClick={news}>news</button>
            <button onClick={testVocab}>testvoc</button>
            <button onClick={testUnderstanding}>tund</button>
            <button onClick={testFuture}>tfut</button><br></br>
            <select id={"bot"}>
                <option value="Assistant">Assistant</option>
                <option value="GPT-4">GPT-4</option>
                <option value="Claude-2-100k">Claude-2-100k</option> 
            </select>
            <MultiSelect
        options={options}
        value={selected}
        onChange={setSelected}
        hasSelectAll={false}
        disableSearch
        labelledBy="Select"
      />
            <textarea cols={40} rows={3} id={"aifield"}></textarea><br></br>
            <input type="checkbox" id={"clearbox"}></input>clear               
            <button onClick={()=> {
                let org = document.getElementById('aifield').value;
                document.getElementById('aifield').value = '';
                selected.sort( function(a,b) {
                    return a.value - b.value;
                })                
                for(var i=0;i<selected.length;i++) {                    
                    document.getElementById('aifield').value = document.getElementById('aifield').value + ' ' + _templates[selected[i].value];
                }
                document.getElementById('aifield').value = document.getElementById('aifield').value + ' ' + org;
                let aitext = document.getElementById('aifield').value;
                window.lastAItext = aitext;
                let bot = document.getElementById('bot').value;
                window.lastBot = bot;
                aitext = expandMacros(aitext);
                if (aitext == null) {
                    return;
                }
                callPoe(cwsid,aitext,bot, (aitext[0] == ' '));
                closeOverlay();
            }}>AI</button>
        </Overlay>
        <Container>
            <Navigation></Navigation>
            <FloatContainer>
            <FloatButton
                styles={{backgroundColor: darkColors.blue, color: lightColors.white}}
                tooltip="The big plus button!"
                icon="fas fa-plus"
                rotate={true}
                onClick={() => openOverlay()} />
            </FloatContainer>
            <div>                        
            <br></br>           
            </div> 
            <Row>
            <Col md={1}>
            <Button size="sm" variant="light" onClick={pop}>{stackDepth}||</Button>{' '}
            </Col>
            <Col md={9}>
            <Pagination size="sm">{items}</Pagination>
            </Col>
            </Row>
            </Container>
            <Container id="thefulltext">
                <div onClick={simpleLookup}>
            {[...cwstext].map( (c,index) => {
                return mapHTMLToCharacter(c,index)
            })}
            </div>
            <textarea cols={30} rows={20} defaultValue={text} ref={editArea}></textarea><br></br>
            <button onClick={memoryDevice}>memory</button><button onClick={editText}>Update</button>
            </Container>
            <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
          <Modal.Title>{modalheading}</Modal.Title>
        </Modal.Header>
        <Modal.Body dangerouslySetInnerHTML={{__html: modalcontent}}></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close </Button>
          <a href={"/editdictionary?term="+modalheading}>edit</a>
          <Button variant="secondary" onClick={()=>{checkCharacterDetails(modalheading);}}>Details </Button>          
        </Modal.Footer>
      </Modal>
        </div>
    );
}

export default StackedDocumentReader;


/**
 * 
 * 
 *             <button onClick={()=>{eApplyAI('Rewrite this using chinese so that a 12 year old child would understand:');}}>EApply 12</button>
            <button onClick={()=>{eApplyAI('Rewrite this using chinese so that a 10 year old child would understand:');}}>EApply 10</button>             
            <button onClick={()=>{eApplyAI('Rewrite this using chinese so that a 8 year old child would understand:');}}>EApply 8</button>
            <button onClick={()=>{eApplyAI('Rewrite this using chinese so that a 6 year old child would understand:');}}>EApply 6</button>
            <button onClick={()=>{eApplyAI('Rewrite this using chinese so that an intermediate student of chinese would understand');}}>EApply student</button>
            <button onClick={()=>{eApplyAI('Rewrite this using chinese using only simple words and very short sentences');}}>Simple&Short</button>
            <button onClick={()=>{eApplyAI('Rewrite this using chinese using short sentences and words that a 8 year old would understand');}}>Simple&Short8</button>            
            <button onClick={()=>{eApplyAI('Rewrite this using chinese using short sentences, words that a child old would understand and put a _ before all personal names:');}}>Names</button>

 * 
 * 
 */