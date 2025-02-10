import { Row,Col,Button,Container } from "react-bootstrap";


import { useState,useRef } from "react";
import Navigation from "./Navigation";

import { UserContext } from "../App";


import React from "react";

import { backEndCall } from "./backendapi/backendcall";


const Admin = ()=> {
    const homeCommandField = useRef();
    const homeCommandDirectory = useRef();
    const definitionField = useRef();

    const homeCommand = () => {
        backEndCall("executehomecommand",{
            command:homeCommandField.current.value,
            directory:homeCommandDirectory.current.value
        }).then(res=> {
            console.log(res);}
        );
    }

                
    return (
        <div>            
            <Container>
                <Navigation></Navigation>
                <h2>Admin</h2>
                Command : <input type="text" ref={homeCommandField}></input><br></br>
                Home Directory : <input type="text" ref={homeCommandDirectory}></input><br></br>                
                <Button className="btn-block mr-1 mt-1 btn-lg" onClick={()=> { homeCommand(); }}>Run Home</Button>
            </Container>
        </div>
    )
}

export default Admin;