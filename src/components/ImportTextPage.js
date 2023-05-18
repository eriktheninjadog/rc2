import React from "react";

import { UserContext } from "../App";
import Navigation from "./Navigation";
import { Button } from "react-bootstrap";
import { createMockDocument } from "../datacomponents/MockDataProducer";


const ImportTextPage = ()=> {
    const value = React.useContext(UserContext);  

    const generatedoc = ()=> {
        let m = createMockDocument();
        value.documentStack.push(m);
        value.documentStack.saveToLocaLStorage();
        console.log(value.documentStack);
    }   

    return (
        <div>
            <Navigation></Navigation>
        <h1>Import Text Page</h1>    
        <button onClick={generatedoc}>hello</button>    
        </div>
    );
}

export default ImportTextPage;