import React, { useState } from "react";

import Pagination from 'react-bootstrap/Pagination';
import Navigation from "./Navigation";
import { Row,Col,Button,Container } from "react-bootstrap";
import { UserContext } from "../App";
import RCDocumentReader from "../datacomponents/RCDocumentReader";
import { lookUpPosition } from "./backendapi/backendcall";

const StackedDocumentReader = ()=> {

    let items = [];
    let cwsid = -1; 
    const [activePage,setActivePage] = useState(0);
        
    const value = React.useContext(UserContext);
    let docreader = value.documentStack.visibleDocument(value.documentStack.depth());
    console.log(docreader);   
    const [stackDepth,setStackDepth] = useState(0);

    const setPage = idx => {
        docreader.setPage(idx);
        setActivePage(idx);
    }

    const lookup = (event) => {
        lookUpPosition(cwsid,parseInt(event.target.id),
            data => {
                    value.documentStack.addArrayOfCwsAsDocument(data);
                    console.log(data);
                    setActivePage(0);

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

    const addQuestions = () => {
        addQuestions(cwsid,data=>{console.log(data)})
    }

    return (
        <div>
            <Container>
            <Navigation></Navigation>
            <button onClick={incFont}>+</button><button onClick={decFont}>-</button>
            <button onClick={addQuestions}>q</button>
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
                <div onClick={lookup}>
            {[...text].map( (c,index) => {
                return mapHTMLToCharacter(c,index)
            })}
            </div>
                </Container>
        </div>
    );
}

export default StackedDocumentReader;