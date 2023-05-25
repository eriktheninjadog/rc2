import { Container } from "react-bootstrap";
import { useState,useRef } from "react";
import Navigation from "./Navigation";

import { useSearchParams } from "react-router-dom";
import { dictionaryLookup, updateDictionary } from "./backendapi/backendcall";


const EditDictionary = () => {
    
    const [searchParams] = useSearchParams();

    const [chinese,setChinese] = useState('');
    const [jyutping,setJyutping] = useState('');
    const [definition,setDefinition] = useState('');

    const chineseField = useRef();
    const jyutpingField = useRef();
    const definitionField = useRef();

    if (chinese.length == 0) {
        dictionaryLookup(searchParams.get('term'),term =>
        {
            chineseField.current.value = term[0];
            jyutpingField.current.value = term[1];
            definitionField.current.value = term[2];
        })
    }

    const update = async ()  => {
        updateDictionary(chineseField.current.value,
            jyutpingField.current.value,
            definitionField.current.value);
    }

    return (
        <div>
            <Container>
            <Navigation></Navigation>
            <input type="text" size="30" ref={chineseField} ></input><br></br>
            <input type="text" size="30" ref={jyutpingField}></input><br></br>
            <textarea ref={definitionField}>
            </textarea><br></br>
            <button onClick={update}>Post</button><br></br>
            <button>Pleco</button>
            </Container>
        </div>
    );

}

export default EditDictionary;