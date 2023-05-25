import { Row,Col,Button,Container } from "react-bootstrap";


import { useState } from "react";
import Navigation from "./Navigation";


import { sizeOfDeck, invalidateWord,validateWord,pickWord,getJyutpingFlashcard,getDefinitionFlashcard } from "./backendapi/flashcardengine";



const FlashCard = ()=> {

    const [header,setHeader] = useState('');
    const [pronounce,setPronounce] = useState('');
    const [definition,setDefinition] = useState('');
    const [deckSize,setDeckSize] = useState(0);

    const pickNewWord = () => {
        setPronounce('');
        setDefinition('');
        setHeader(pickWord());
        setDeckSize( sizeOfDeck() );
    }

    const showBackside = () => {
        setPronounce(getJyutpingFlashcard(header));
        setDefinition(getDefinitionFlashcard(header));
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
                <h1>{header}</h1><br></br>
                <h2>{pronounce}</h2><br></br>
                 <span>{definition}</span><br></br>    
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