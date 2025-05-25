import React from "react";
import { UserContext } from "../App";
import Navigation from "./Navigation";
import { Button, Container } from "react-bootstrap";
import { createMockDocument } from "../datacomponents/MockDataProducer";
import {backEndCall,addTextToBackground} from "./backendapi/backendcall";
import { useRef } from "react";
import { useState } from "react";
import IntelligentText from './IntelligentText';



const mykeyhandler = (key) => {
}
   

const ImportTextPage = ()=> {
    const value = React.useContext(UserContext);
    const textarea = useRef();
    const title = useRef();

    const [tokens,setTokens] = useState([]);


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

    const importAuth = async () => {
        console.log('did auth');
        
        fetch('https://chinese.eriktamm.com/api/set_ai_auth?auth_part=' + textarea.current.value).then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    const importText = async () => {
        console.log(textarea)
        let question = textarea.current.value;
        backEndCall("tokenize_chinese",{"text":question},(result)=>{
            setTokens(result);
        },(error)=>{console.log(error)});
    }
    

    const processText = () => {
        console.log(textarea)
        let question = textarea.current.value;
        backEndCall("ai_anything",{"question":question},(result)=>{
            setTokens(result);
        },(error)=>{console.log(error)});
    }
    
    return (
        <div>
        <Container>
            <Navigation></Navigation>
        <h1>Import Text Page</h1>    
        <button onClick={generatedoc}>document</button>    
        <button onClick={testApi}>testApi</button>  
        <br></br>
        <input type="text" ref={title} size="80"></input>
        <textarea  ref={textarea} cols="30" rows="10">
            </textarea>
        <br></br>    
        <button onClick={processText}> Ask AI</button>
        <button onClick={importText}> Import</button>
        <button onClick={importAuth}> Auth</button>

        </Container>
        <IntelligentText tokens={tokens} keyhandler={mykeyhandler}></IntelligentText> 
        </div>
    );
}

export default ImportTextPage;

