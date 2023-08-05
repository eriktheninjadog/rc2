import React, { useState,useEffect } from "react";

import Pagination from 'react-bootstrap/Pagination';
import Navigation from "./Navigation";
import { Row,Col,Button,Container } from "react-bootstrap";
import { UserContext } from "../App";
import { fakeWiki,extensibleSimplify,retrieveValueFromServer,storeValueOnServer,directAIQuestionBackend, explainParagraph,getTestQuestion, amazonTranslateFromChinese, dictionaryLookup,directAIAnalyze,directAIAnalyzeGrammar,directAISummarize,directAISimplify,localLookup, addQuestions, getCwsById, lookUpPosition } from "./backendapi/backendcall";
import {getFailedCards,saveCardsToStorage,clearAllCards, addWordIfNotExist, sizeOfDeck} from "./backendapi/flashcardengine" 
import { clearTotalWorkTime,getTotalWorkTime,addToWorkTime } from "./backendapi/workcounter";


import Overlay from "react-overlay-component";


import { lightColors, darkColors,Container as FloatContainer, Button as FloatButton, Link as FloatLink} from 'react-floating-action-button'

import Modal from 'react-bootstrap/Modal';

const StackedDocumentReader = ()=> {

    const [show, setShow] = useState(false);

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

    const closeOverlay = () => {
        setOverlay(false);
        restorePosition();
    }

    const openOverlay = () => {
        addToWorkTime();
        let g = storedPosition;
        g[cwsid] = window.pageYOffset;
        setStoredPosition(g);
        setOverlay(true);
    }

    const setPage = idx => {
        addToWorkTime();
        docreader.setPage(idx);
        setActivePage(idx);
    }

    const addToWork = () => {
        addToWorkTime();
        setReadingTime( getTotalWorkTime() );
    }

    const simpleLookup = (event) => {

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
        dictionaryLookup(word,result => {
            setmodalcontent(result[0] +  " " + result[1] + " " + result[2]);
            addWordIfNotExist(word);
            saveCardsToStorage();
            if (sizeOfDeck() > 10 ) {
                window.location.href = 'flash';
            }
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
        setTimeout(restorePosition,1000);
        retrieveValueFromServer('bookmarks','furthest_read'+cwsid, furthestRead => {
            if (furthestRead == null) {
                window.furthestRead = 0;
            } else {
                window.furthestRead = furthestRead;
                document.getElementById(''+furthestRead).style.background = '#9999FF'
            }
        });
        addToWorkTime();
    }

    const mapHTMLToCharacter= (c,index) => {
        idcounter++;
        if (c == '\n') {
            return (<br id={index}></br>)
        }
        if (c == ' ') {
            return (<span id={index}>&nbsp;</span>)
        }
        idcounter += c.length - 1;
        return (<span orgidx={idcounter}  id={index} className="App"> {c}</span>);
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


    const esimple = async () => {
        alert('Esimple are you sure?');
        extensibleSimplify(cwsid, result => {console.log(result)});
    }

    const fake = async () => {
        fakeWiki(result => {console.log(result)});
    }

    const configs = {
        animate: false
    };

    return (
        <div>
        <Overlay configs={configs} isOpen={isOpen} closeOverlay={closeOverlay}>
            {readingTime}<button onClick={clearTotalWorkTime}>res</button>
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
            <button onClick={fake}>Fake</button> 
            
            <br></br>
            <button onClick={()=>{ directAIExplain("Explain the grammar of this text:");}}>Ex Grammar</button>
            <button onClick={()=>{ directAIExplain("What are the nouns in this text:");}}>Nouns</button>
            <button onClick={()=>{ directAIExplain("What are the verbs in this text:");}}>Verbs</button>
            <button onClick={()=>{ directAIExplain("Summarize this text in HSK 6 level Chinese:");}}>Sum</button><br></br>
            <button onClick={()=>{ directAIExplain("Make a list of the nouns and the verbs in this text:");}}>Word list</button>
            <button onClick={()=>{ directAIExplain("Rewrite this in chinese so that a HSK 6 student could understand:");}}>Rewrite</button>
            <button onClick={()=>{ directAIExplain("Rewrite this in chinese using only simple words:");}}>Simple</button>

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
            </Container>
            <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
          <Modal.Title>{modalheading}</Modal.Title>
        </Modal.Header>
        <Modal.Body dangerouslySetInnerHTML={{__html: modalcontent}}></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close </Button>
          <a href={"/editdictionary?term="+modalheading}>edit</a>
        </Modal.Footer>
      </Modal>
        </div>
    );
}

export default StackedDocumentReader;