import { Row,Col,Button,Container } from "react-bootstrap";


import { useState,useRef } from "react";
import Navigation from "./Navigation";

import { UserContext } from "../App";


import React from "react";

import { directAIAnalyze,directAIAnalyzeGrammar,directAISummarize,directAISimplify,localLookup, addQuestions, getCwsById, lookUpPosition } from "./backendapi/backendcall";
import { purgeCards, sizeOfDeck, invalidateWord,validateWord,pickWord,getJyutpingFlashcard,getDefinitionFlashcard, clearAllCards } from "./backendapi/flashcardengine";
import context from "react-bootstrap/esm/AccordionContext";
import RCDocumentStack from "../datacomponents/RCDocumentStack";
import { clearTotalWorkTime,getTotalWorkTime,addToWorkTime } from "./backendapi/workcounter";



const FlashCard = ()=> {

    const [header,setHeader] = useState('');
    const [pronounce,setPronounce] = useState('');
    const [definition,setDefinition] = useState('');
    const [deckSize,setDeckSize] = useState(0);
    const [content,setContent] = useState('');
    const value = React.useContext(UserContext);
    const [readingTime,setReadingTime] = useState(0);
    const writeField = useRef();

    const addToWork = () => {
        addToWorkTime();
        setReadingTime( getTotalWorkTime() );
    }

    const pickNewWord = () => {
        let picked = '';
        setPronounce('');
        setDefinition('');
        picked = pickWord();
        setHeader(picked);
        setDeckSize( sizeOfDeck() );
        setTimeout(()=>{
            if (Math.random() > 0.8 ) {
                writeField.current.value = '';
            } else {
                writeField.current.value = picked;
            }
        },1000 );
    }

    const showBackside = () => {
        setPronounce(getJyutpingFlashcard(header));
        setDefinition(getDefinitionFlashcard(header));               
    }

    const simpleLookup = (event) => {
        console.log(event.target.innerText);
        let res = localLookup(event.target.innerText );
        console.log(res);
        let r = '';
        res.forEach(element => {
            r = r + element[0] + '  ' + element[1] + ' ' + element[2] + '\n'
        });
        alert(r);
    }

    const flipButton = () => {
        showBackside();
    }

    const nextButton = () => {
        pickNewWord();
    }

    const successButton = () => {
        if ( writeField.current.value != header ) {
            return;
        }
        validateWord(header);
        if (sizeOfDeck() == 0) {
            clearAllCards();
            window.location.href = 'reader';
            return;
        }
        pickNewWord();
        addToWork();
    }

    const failureButton = () => {
        invalidateWord(header);
        pickNewWord();
    }

    const randomButton = () => {
        validateWord(header);
    }

    if (header === '') {
        pickNewWord();        
    }

    return (
        <div>            
            <Container>
                <Navigation></Navigation>
                <h5>{deckSize}/{readingTime}</h5>
                <h1>{header}</h1><a href={"/editdictionary?term="+header+""} >edit</a><br></br>
                <input type="text" ref={writeField}></input><br></br>
                <h2>{pronounce}</h2><br></br>
                 <span>{definition}</span><br></br>
                <Button className="btn-block mr-1 mt-1 btn-lg" onClick={flipButton}>Flip</Button>
                <Button className="btn-block mr-1 mt-1 btn-lg" onClick={successButton}>Success</Button>                
                <Button className="btn-block mr-1 mt-1 btn-lg" onClick={failureButton}>Failure</Button>                                
                <Button className="btn-block mr-1 mt-1 btn-lg" onClick={nextButton}>Next</Button>
                <Button className="btn-block mr-1 mt-1 btn-lg" onClick={randomButton}>Random</Button>                
            </Container>
        </div>
    )
}

export default FlashCard;