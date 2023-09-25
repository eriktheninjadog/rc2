import React, { useState,useEffect, useRef } from "react";

import Pagination from 'react-bootstrap/Pagination';
import Navigation from "./Navigation";
import { Row,Col,Button,Container } from "react-bootstrap";
import { UserContext } from "../App";
import { getMemoryDevice,updateCws,getCharacterCWS, directAIQuestionsBackend   ,classify,lookuphistory,addlookup,createWordList,fakeWiki,extensibleApplyAI,extensibleSimplify,retrieveValueFromServer,storeValueOnServer,directAIQuestionBackend, explainParagraph,getTestQuestion, amazonTranslateFromChinese, dictionaryLookup,directAIAnalyze,directAIAnalyzeGrammar,directAISummarize,directAISimplify,localLookup, addQuestions, getCwsById, lookUpPosition } from "./backendapi/backendcall";
import { getFailedCards,saveCardsToStorage,clearAllCards, addWordIfNotExist, sizeOfDeck} from "./backendapi/flashcardengine" 
import { getTotalReadCharacter,addCharactersToWork,clearTotalWorkTime,getTotalWorkTime,addToWorkTime } from "./backendapi/workcounter";


import Overlay from "react-overlay-component";


import { lightColors, darkColors,Container as FloatContainer, Button as FloatButton, Link as FloatLink} from 'react-floating-action-button'

import Modal from 'react-bootstrap/Modal';

const StackedDocumentReader = ()=> {

    const [show, setShow] = useState(false);

    const [knownChars, setknownChars] = useState([]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
  
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

    const simpleLookup = (event) => {
        
        if (event.target.id == "") {
            restorePosition();
            return;
        }

        if (event.target.id == lastElementId) {
            lookup(event);
            return;
        }

        if (lastLastElementId != 0) {
            if (document.getElementById(lastLastElementId) != null) 
                document.getElementById(lastLastElementId).style.backgroundColor = "#FFFFFF";
        }

        if (parseInt(event.target.id) > window.furthestRead  ) {
            console.log('storing value on server;' + parseInt(event.target.id))
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
        setmodalheading(word);

        if (word.length > 10) {
            return;
        }
        if (window.known == undefined) {
            window.known = [];
        }
        window.known.push(word);
        if (word.length > 0 && word != '。' &&  word != ',' && word != '」' && word != '」' && word != '？')
            addlookup(cwsid,word);
        dictionaryLookup(word,result => {
            setmodalcontent(result[0] +  " " + result[1] + " " + result[2]);
            addWordIfNotExist(word);
            saveCardsToStorage();
            /*
            for now we will not doing flashcards unless we are above 17 exposure
            if (sizeOfDeck() > 10 ) {
                window.location.href = 'flash';
            }*/
        });
        handleShow();
        setlastLastElementId(lastElementId);
        setlastElementId(event.target.id);
        addToWork();
    }

    const lookup = (event) => {
        let g = storedPosition;
        g[cwsid] = window.pageYOffset;
        setStoredPosition(g);
        var p = 0;
        var cwsidx = event.target.id;
        for (var i=0; i < cwsidx;i++) {
            p = p + cwstext[i].length;
        }
        lookUpPosition(cwsid,p,
            data => {
                    value.documentStack.addArrayOfCwsAsDocument(data);
                    setActivePage(0);
                    setStackDepth(value.documentStack.depth());
                });
        addToWork();
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

    const directAIExplain = async (question) => {
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
        directAIQuestionBackend(cwsid,question,orgStart,parseInt(orgEnd), cws => { 
            if (cws[2].indexOf('ouns') != -1 && cws[2].indexOf('erbs') != -1 ) {
                var p = -1;
                for (var i =0; i< cws[3].length;i++) {
                    if (cws[3][i].indexOf('ouns') != -1) {
                        p = i;
                    }
                }
                clearAllCards();
                alert(' ' + p + ' ');
                for (var i = p; i < cws[3].length;i++) {
                    addWordIfNotExist(cws[3][i]);
                    saveCardsToStorage();
                    console.log(cws[3][i]);
                }
                //window.location.href = 'flash';
                return;
            }
            value.documentStack.addSingleCwsAsDocument(cws);
            setActivePage(0);
            setStackDepth(value.documentStack.depth());
        });    
        closeOverlay();
    }

    const directAIExplains = async (questions) => {
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
        directAIQuestionsBackend(cwsid,questions,orgStart,parseInt(orgEnd), cws => { 
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




    return (
        <div>
        <Overlay configs={configs} isOpen={isOpen} closeOverlay={closeOverlay}>
            {cwstitle}
            <br></br>
            {readingTime}/{getTotalReadCharacter()}<button onClick={clearTotalWorkTime}>res</button>{((getTotalReadCharacter()/readingTime)*1.6)*60}
            <br></br>
            <button onClick={incFont}>+</button><button onClick={decFont}>-</button>
            <button onClick={restorePosition}>r</button>
            <button onClick={translate}>Tran</button> 
            <button onClick={getFailedCards}>Hard</button>             
            <br></br>
            <button onClick={clearAllCards}>clr F</button> 
            <button onClick={testQuestion}>Test</button> 
            <button onClick={explainPara}>Explain</button> 
            <button onClick={esimple}>ESimple</button> 
            <button onClick={()=>{eApplyAI('Rewrite this using chinese so that a 12 year old child would understand:');}}>EApply 12</button>
            <button onClick={()=>{eApplyAI('Rewrite this using chinese so that a 10 year old child would understand:');}}>EApply 10</button>             
            <button onClick={()=>{eApplyAI('Rewrite this using chinese so that a 8 year old child would understand:');}}>EApply 8</button>
            <button onClick={()=>{eApplyAI('Rewrite this using chinese so that a 6 year old child would understand:');}}>EApply 6</button>
            <button onClick={()=>{eApplyAI('Rewrite this using chinese so that an intermediate student of chinese would understand');}}>EApply student</button>
            <button onClick={()=>{eApplyAI('Rewrite this using chinese using only simple words and very short sentences');}}>Simple&Short</button>
            <button onClick={()=>{eApplyAI('Rewrite this using chinese using short sentences and words that a 8 year old would understand');}}>Simple&Short8</button>            
            <button onClick={()=>{eApplyAI('Rewrite this using chinese using short sentences, words that a child old would understand and put a _ before all personal names:');}}>Names</button>
            <button onClick={wordlist}>Wordlist</button>             
            <br></br>
            <button onClick={()=>{ directAIExplains([
                "Translate this text to english",
                "Rewrite this text in chinese so that a child could understand",
                "Rewrite this text in chinese so that a teenager would understand",
                "Rewrite this text in chinese using synonyms",
                "Rewrite this text in chinese make it more sophisticated",
                "Explain the grammar points in this text",
                "List parts of speech in this text"                
                ]);}}>Deep analysis</button>
            <button onClick={readability}>Read %</button>
            <button onClick={markread}>markread</button>
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
                <div  onDoubleClick={lookup} onClick={simpleLookup}>
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