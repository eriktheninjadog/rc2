
import React, { useState } from "react";

import Pagination from 'react-bootstrap/Pagination';
import Navigation from "./Navigation";
import { Row,Col,Button,Container } from "react-bootstrap";
import { UserContext } from "../App";
import RCDocumentReader from "../datacomponents/RCDocumentReader";

const StackedDocumentReader = ()=> {

    let items = [];
    const [activePage,setActivePage] = useState(0);
        
    const value = React.useContext(UserContext);
    let docreader = value.documentStack.visibleDocument(value.documentStack.depth());
    console.log(docreader);   
    const [stackDepth,setStackDepth] = useState(0);

    const setPage = idx => {
        docreader.setPage(idx);
        setActivePage(idx);
    }

    const lookup = (event) =>
    {
        console.log(event.target.id)
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
    }

    return (
        <div>
            <Container>
            <Navigation></Navigation>
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
                return (<span id={index}> {c}</span>);
            })}
            </div>
                </Container>
        </div>
    );
}

export default StackedDocumentReader;