import React from "react";
import { UserContext } from "../App";
import Navigation from "./Navigation";
import { Button } from "react-bootstrap";
import { createMockDocument } from "../datacomponents/MockDataProducer";
import {backEndCall,addTextToBackground} from "./backendapi/backendcall";
import { useRef } from "react";

const ImportTextPage = ()=> {
    const value = React.useContext(UserContext);  
    //let docreader = value.documentStack.visibleDocument(value.documentStack.depth());


    const textarea = useRef();

    const generatedoc = ()=> {
        let m = createMockDocument();
        value.documentStack.push(m);
        value.documentStack.saveToLocaLStorage();
        console.log(value.documentStack);
    }
    
    const testApi = () => {
        backEndCall('version',{},
        result=> { console.log(result)},
        error => { console.log(error)});
    }

    const processText = () => {
        console.log(textarea)
        let body = textarea.current.value;
        console.log('body ' + body)
        let source = "free input";
        let title = "free input";
        let parentCWSid = -1;
        //title,source,body,parentCwsId,succecallback
        addTextToBackground(title,source,body,-1,
            data => {
                value.documentStack.addSingleCwsAsDocument(data);
                console.log(data)}  
            );
    }
    
    return (
        <div>
            <Navigation></Navigation>
        <h1>Import Text Page</h1>    
        <button onClick={generatedoc}>document</button>    
        <button onClick={testApi}>testApi</button>  
        <br></br>
        <textarea  ref={textarea} cols="30" rows="10">
            </textarea>
        <br></br>    
        <button  onClick={processText}> Submit</button>
        </div>
    );
}

export default ImportTextPage;