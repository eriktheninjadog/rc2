import React, { useState } from "react";

import SidebarMenu from 'react-bootstrap-sidebar-menu';


import Pagination from 'react-bootstrap/Pagination';
import Navigation from "./Navigation";
import { Row,Col,Button,Container } from "react-bootstrap";
import { UserContext } from "../App";
import RCDocumentReader from "../datacomponents/RCDocumentReader";
import { explainParagraph,getTestQuestion, amazonTranslateFromChinese, dictionaryLookup,directAIAnalyze,directAIAnalyzeGrammar,directAISummarize,directAISimplify,localLookup, addQuestions, getCwsById, lookUpPosition } from "./backendapi/backendcall";
import {saveCardsToStorage,clearAllCards, addWordIfNotExist, sizeOfDeck} from "./backendapi/flashcardengine" 
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

        let g = storedPosition;
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
        let pos = 0;
        if (cwsid in storedPosition) {
            pos = storedPosition[cwsid];
        }
        document.documentElement.scrollTop = pos;
        document.documentElement.style.setProperty('--reading-font-size', '20px');
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
        addToWorkTime();
    }

    const mapHTMLToCharacter= (c,index) => {
        if (c == '\n') {
            return (<br id={index}></br>)
        }
        if (c == ' ') {
            return (<span id={index}>&nbsp;</span>)
        }
        return (<span id={index} className="App"> {c}</span>);
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

    const addQuestionsFromDocument = () => {
        addQuestions(cwsid,data=>{console.log(data)})
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

    const editVocab = () => {
        
    }

    const flashCards = async ()  => {
        let q = [];
        getCwsById(cwsid,
            cwsobject => {
                cwsobject[3].forEach(word => {
                    q.push(word);
                })
            }
        );
        clearAllCards();
        setInterval(function () {
            if ( q.length > 0) {
                let w = q.pop();
                addWordIfNotExist(w);
                saveCardsToStorage();
            }
        }, 200);
    }

    const ui_directAIAnalyze = async ()  => {
        directAIAnalyze(cwsid,parseInt(lastElementId),parseInt(lastLastElementId),
            cws => {
                value.documentStack.addArrayOfCwsAsDocument([cws]);
                setStackDepth(value.documentStack.depth());
            }
            );
    }

    const ui_directAIAnalyzeGrammar = async () => {
        let selection = document.getSelection();
        if (selection == null)
            return;
        if (selection == undefined)
            return;
        directAIAnalyzeGrammar(cwsid,parseInt(lastElementId),parseInt(lastLastElementId),
            cws => {
                value.documentStack.addArrayOfCwsAsDocument([cws]);
                setStackDepth(value.documentStack.depth());
            }
            );
    }

    const ui_directAIASummarize = async () => {
        let selection = document.getSelection();
        if (selection == null)
            return;
        if (selection == undefined)
            return;
        let fragment = selection.toString();
        directAISummarize(cwsid,parseInt(lastElementId),parseInt(lastLastElementId),
            cws => {
                value.documentStack.addArrayOfCwsAsDocument([cws]);
                setStackDepth(value.documentStack.depth());
            }
            );
    }

    const ui_directAISimplify = async () => {
        let selection = document.getSelection();
        if (selection == null)
            return;
        if (selection == undefined)
            return;
        let fragment = selection.toString();
        directAISimplify(cwsid,parseInt(lastElementId),parseInt(lastLastElementId),
            cws => {
                value.documentStack.addArrayOfCwsAsDocument([cws]);
                setStackDepth(value.documentStack.depth());
            }
            );
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



        const configs = {
            animate: false,
            // top: `5em`,
            // clickDismiss: false,
            // escapeDismiss: false,
            // focusOutline: false,
        };

    return (
        <div>


<Overlay configs={configs} isOpen={isOpen} closeOverlay={closeOverlay}>
{readingTime}<button onClick={clearTotalWorkTime}>res</button>
<br></br>
<button onClick={incFont}>+</button><button onClick={decFont}>-</button>
            <button onClick={addQuestionsFromDocument}>q</button>
            <button onClick={restorePosition}>r</button>
            <button onClick={flashCards}>f</button><br></br>
            <button onClick={ui_directAIAnalyze}>DA1</button>
            <button onClick={ui_directAIAnalyzeGrammar}>DA2</button>
            <button onClick={ui_directAIASummarize}>DA3</button>
            <button onClick={ui_directAISimplify}>DA4</button>
            <button onClick={translate}>Tran</button> <br></br>
            <button onClick={clearAllCards}>clr F</button> 
            <button onClick={testQuestion}>Test</button> 
            <button onClick={explainPara}>Explain</button> 
            
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
          <Button variant="secondary" onClick={handleClose}>
            Close 
          </Button>
          <a href={"/editdictionary?term="+modalheading}>edit</a>
        </Modal.Footer>
      </Modal>
        </div>
    );
}

export default StackedDocumentReader;