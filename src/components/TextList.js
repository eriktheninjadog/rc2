
import React, { useState } from "react";
import { Container } from "react-bootstrap";


import { useEffect } from "react";
import Navigation from "./Navigation";
import { get } from "local-storage";
import {hideById,deleteById, getCwsVocabulary,getCwsById,getImportedTexts } from "./backendapi/backendcall";
import { publishCWSArrived,publishCWSStackChanged } from "./eventsystem/Event";

import { UserContext } from "../App";
import { useRecoilValueLoadable_TRANSITION_SUPPORT_UNSTABLE } from "recoil";

class LimitedQueue {
    constructor(maxLength) {
      this.maxLength = maxLength;
      this.queue = [];
    }
  
    enqueue(item) {
      if (this.queue.length === this.maxLength) {
        this.queue.shift(); 
      }
      this.queue.push(item);
    }
  
    dequeue() {
      if (this.isEmpty()) {
        return null;
      }
      return this.queue.shift();
    }
  
    isEmpty() {
      return this.queue.length === 0;
    }
  
    size() {
      return this.queue.length;
    }

    isInQueue(item) {
        return this.queue.includes(item);
    }

    readFromLocalStorage() {
        let str = localStorage.getItem('pastreads');
        if ( str == null) {
            return;
        }
        this.queue = JSON.parse(str);
    }

    writeToStorage() {
        localStorage.setItem('pastreads', JSON.stringify(this.queue));
    }

  }
  


const TextList = ()=> {


    var pastReads = new LimitedQueue();
    pastReads.readFromLocalStorage();


    const value = React.useContext(UserContext);
    const [texts,setTexts] = useState([]);
    


    const gettext = id =>
    {        
        value.documentStack.clear();
        pastReads.enqueue(id);
        pastReads.writeToStorage();
        getCwsById(id);
    }


    const get_texts = () => {
        getImportedTexts(
            itexts => {
                let oo = [];
                for (var i=0; i < itexts.length;i++) {
                    if (pastReads.isInQueue( itexts[i][0] )) {
                        oo.push(itexts[i]);
                    }
                }
                for (var i=0; i < itexts.length;i++) {
                        oo.push(itexts[i]);
                }
                setTexts(oo);
                }        
        );
    }

    const ui_deleteText = id =>
    {
        //value.documentStack.clear();
        
        deleteById(id);
        /*
        getImportedTexts(
            itexts =>
            itexts => {
                let oo = [];
                for (var i; i < itexts.length;i++) {
                    if (pastReads.isInQueue( itexts[i][0] )) {
                        oo.push(itexts[i]);
                    }
                }
                for (var i; i < itexts.length;i++) {
                        oo.push(itexts[i]);
                }
                 setTexts(oo);
                }        
        );
        */
        return false;
    }

    const ui_hideText = id =>
    {
        //value.documentStack.clear();
        hideById(id);
        /*
        getImportedTexts(
            itexts => {
                let oo = [];
                for (var i; i < itexts.length;i++) {
                    if (pastReads.isInQueue( itexts[i][0] )) {
                        oo.push(itexts[i]);
                    }
                }
                for (var i; i < itexts.length;i++) {
                        oo.push(itexts[i]);
                }
                 setTexts(oo);
                }                
                );
                */
        return false;

    }

    return (
        <div>
        <Container>    
        <Navigation></Navigation>
        <h1><button onClick={()=>get_texts()}>Texts</button></h1>
        <table>
            <tr></tr>
            {texts.map( (item,index) => 
            {
                return (<tr><td>{item[0]}</td><td><a href="#" onClick={()=>ui_deleteText(item[0]) }>delete</a></td>
                <td><a href="#" onClick={()=>ui_hideText(item[0]) }>hide</a></td>                
                <td><a href="#" onClick={()=>gettext(item[0]) }>{item[6]}</a></td></tr>);
            }            
            )}
        </table>
        </Container>
        </div>
    );
}

export default TextList;