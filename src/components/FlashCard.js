import { Row,Col,Button,Container } from "react-bootstrap";


import { useState } from "react";
import Navigation from "./Navigation";

import { UserContext } from "../App";


import React from "react";

import { directAIAnalyze,directAIAnalyzeGrammar,directAISummarize,directAISimplify,localLookup, addQuestions, getCwsById, lookUpPosition } from "./backendapi/backendcall";
import { sizeOfDeck, invalidateWord,validateWord,pickWord,getJyutpingFlashcard,getDefinitionFlashcard } from "./backendapi/flashcardengine";
import context from "react-bootstrap/esm/AccordionContext";
import RCDocumentStack from "../datacomponents/RCDocumentStack";


const FlashCard = ()=> {

    const [header,setHeader] = useState('');
    const [pronounce,setPronounce] = useState('');
    const [definition,setDefinition] = useState('');
    const [deckSize,setDeckSize] = useState(0);
    const [content,setContent] = useState('');


    const value = React.useContext(UserContext);

    
    const pickNewWord = () => {
        setPronounce('');
        setDefinition('');
        setHeader(pickWord());
        setDeckSize( sizeOfDeck() );
    }

    const showBackside = () => {
        setPronounce(getJyutpingFlashcard(header));
        setDefinition(getDefinitionFlashcard(header));
        // so this is where it gets tricky!
        let examples = value.documentStack.getExamples(header);
        let r = '';
        for (var i=0;i<examples.length && i < 10;i++) {
            r = r + examples[i] + '<br/>'         
        }
        r = r.replace(header,'***'+header+'***')
        let rr ='';
        for (var j=0;j<r.length;j++) {
            rr = rr + '<span>' + r[j] + '</span>'
        }
        setContent(rr);
        
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
        validateWord(header);
        pickNewWord();
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
                <h5>{deckSize}</h5>
                <h1>{header}</h1><a href={"/editdictionary?term="+header+""} >edit</a><br></br>
                <h2>{pronounce}</h2><br></br>
                 <span>{definition}</span><br></br>   
                 <span dangerouslySetInnerHTML={{__html: content}} onClick={simpleLookup}></span><br></br>                    
                 <Row>
                <Col md={2}><Button className="btn-block mr-1 mt-1 btn-lg"
 onClick={flipButton}>Flip</Button>
                </Col>
                <Col md={2}><Button className="btn-block mr-1 mt-1 btn-lg" onClick={successButton}>Success</Button>
                </Col>
                <Col md={2}>
                <Button className="btn-block mr-1 mt-1 btn-lg" onClick={failureButton}>Failure</Button>                
                </Col>
                <Col md={2}>
                <Button className="btn-block mr-1 mt-1 btn-lg" onClick={nextButton}>Next</Button>
                </Col>
                <Col md={2}>
                <Button className="btn-block mr-1 mt-1 btn-lg" onClick={randomButton}>Random</Button>                
                </Col>
                </Row>             
            </Container>
        </div>
    )

}


export default FlashCard;