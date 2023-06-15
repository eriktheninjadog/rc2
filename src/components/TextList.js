
import React, { useState } from "react";
import { Container } from "react-bootstrap";


import { useEffect } from "react";
import Navigation from "./Navigation";
import { get } from "local-storage";
import { getCwsVocabulary,getCwsById,getImportedTexts } from "./backendapi/backendcall";

import { UserContext } from "../App";


const TextList = ()=> {

    const value = React.useContext(UserContext);
    const [texts,setTexts] = useState([]);

    const gettext = id =>
    {
        value.documentStack.clear();
        getCwsById(id, returnedCws=>{
            value.documentStack.addSingleCwsAsDocument(returnedCws);
        });
        getCwsVocabulary(id);
    }

    if (texts.length == 0) {
        getImportedTexts(
            itexts =>
            { setTexts(itexts);}
        )}

    return (
        <div>
        <Container>    
        <Navigation></Navigation>
        <h1>Texts</h1>
        <table>
            <tr></tr>
            {texts.map( (item,index) => 
            {
                return (<tr><td>{item[0]}</td><td><a href="#" onClick={()=>gettext(item[0]) }>{item[6]}</a></td></tr>);
            }            
            )}
        </table>
        </Container>
        </div>
    );
}

export default TextList;