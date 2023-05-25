import React, { useState } from "react";

import Pagination from 'react-bootstrap/Pagination';
import Navigation from "./Navigation";
import { Row,Col,Button,Container } from "react-bootstrap";
import { UserContext } from "../App";
import RCDocumentReader from "../datacomponents/RCDocumentReader";
import { directAIAnalyze,directAIAnalyzeGrammar,directAISummarize,directAISimplify,localLookup, addQuestions, getCwsById, lookUpPosition } from "./backendapi/backendcall";

import {saveCardsToStorage,clearAllCards, addWordIfNotExist} from "./backendapi/flashcardengine" 


const StackedDocumentReader = ()=> {

    let items = [];
    let cwsid = -1; 
    const [activePage,setActivePage] = useState(0);
    const [storedPosition,setStoredPosition]  = useState(0);
        
    const value = React.useContext(UserContext);
    let docreader = value.documentStack.visibleDocument(value.documentStack.depth());
    console.log(docreader);   
    const [stackDepth,setStackDepth] = useState(0);

    const setPage = idx => {
        docreader.setPage(idx);
        setActivePage(idx);
    }

    let lastElementId = 0;

    const simpleLookup = (event) => {
        if (event.target.id == lastElementId) {
            lookup(event);
            return;
        }
        lastElementId = event.target.id;
        console.log(event.target.innerText);
        let res = localLookup(event.target.innerText );
        console.log(res);
        let r = '';
        res.forEach(element => {
            r = r + element[0] + '  ' + element[1] + ' ' + element[2] + '\n'
        });
        alert(r);
    }

    const lookup = (event) => {
        setStoredPosition(window.pageYOffset);
        //alert(window.pageYOffset);
        lookUpPosition(cwsid,parseInt(event.target.id),
            data => {
                    value.documentStack.addArrayOfCwsAsDocument(data);
                    console.log(data);
                    setActivePage(0);
                    setStackDepth(value.documentStack.depth());
                });
    }

    const pop = () => {
        value.documentStack.pop();
        if (stackDepth != value.documentStack.depth()) {
            setStackDepth(value.documentStack.depth());
        }
    }
    let text ='';
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
    }

    const mapHTMLToCharacter= (c,index) => {
        if (c == '\n') {
            return (<br></br>)
        }
        if (c == ' ') {
            return (<span>&nbsp;</span>)
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
    const restorePosition = () => {
        document.documentElement.scrollTop = storedPosition;
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

    //directAIAnalyze,directAIAnalyzeGrammar,directAISummarize,directAISimplify
    const ui_directAIAnalyze = async ()  => {
        let selection = document.getSelection();
        if (selection == null)
            return;
        if (selection == undefined)
            return;
        let fragment = selection.toString();
        directAIAnalyze(cwsid,fragment,
            cws => {
                value.documentStack.addArrayOfCwsAsDocument([cws]);
                setStackDepth(value.documentStack.depth());
            }
            );
    }

    const ui_directAIAnalyzeGrammar = async () => {
        
    }

    const ui_directAIASummarize = async () => {
        
    }

    const ui_directAISimplify = async () => {
        
    }
 
    return (
        <div>
            <Container>
            <Navigation></Navigation>
            <button onClick={incFont}>+</button><button onClick={decFont}>-</button>
            <button onClick={addQuestionsFromDocument}>q</button>
            <button onClick={restorePosition}>r</button>
            <button onClick={flashCards}>f</button>
            <button onClick={ui_directAIAnalyze}>DA1</button>
            <button onClick={ui_directAIAnalyzeGrammar}>DA2</button>
            <button onClick={ui_directAIASummarize}>DA3</button>
            <button onClick={ui_directAISimplify}>DA4</button>
            <br></br>
            
            <Row>
            <Col md={1}>
            <Button size="sm" variant="light" onClick={pop}>{stackDepth}||</Button>{' '}
            </Col>
            <Col md={9}>
            <Pagination size="sm">{items}</Pagination>
            </Col>
            </Row>
            </Container>
            <Container>
                <div  onDoubleClick={lookup} onClick={simpleLookup}>
            {[...text].map( (c,index) => {
                return mapHTMLToCharacter(c,index)
            })}
            </div>
                </Container>
        </div>
    );
}

export default StackedDocumentReader;