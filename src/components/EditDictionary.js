import { Container } from "react-bootstrap";
import { useState,useRef } from "react";
import Navigation from "./Navigation";

import { useNavigate,useSearchParams } from "react-router-dom";
import { amazonTranslateFromChinese, dictionaryLookup, updateDictionary } from "./backendapi/backendcall";


const EditDictionary = () => {
    
    const [searchParams] = useSearchParams();

    const [chinese,setChinese] = useState(searchParams.get('term'));
    const [jyutping,setJyutping] = useState('');
    const [definition,setDefinition] = useState('');

    const chineseField = useRef();
    const jyutpingField = useRef();
    const definitionField = useRef();

    const navigate = useNavigate();



    if (jyutping.length == 0) {        
        dictionaryLookup(searchParams.get('term'),term =>
        {
            chineseField.current.value = searchParams.get('term');
            jyutpingField.current.value = term[1];
            definitionField.current.value = term[2];
        })
    }

    setTimeout(()=>{chineseField.current.value = searchParams.get('term');},1000);

    const update = async ()  => {
        updateDictionary(chineseField.current.value,
            jyutpingField.current.value,
            definitionField.current.value,
            ()=> {
                navigate(-1);
            }
            );
    }

    const getJyutping = () => {
        let chi = chineseField.current.value;
        for (var i=0;i<chi.length;i++) {
            let cha = chi[i];
            dictionaryLookup(''+cha, term=> {
                jyutpingField.current.value = jyutpingField.current.value + ' ' + term[1];
            });
        }
    }

    const plecoAction = () => {
        let url = 'plecoapi://x-callback-url/s?q='+ encodeURI(chineseField.current.value);
        window.open(url)
    }

    const translateAction = () => {
        amazonTranslateFromChinese(chineseField.current.value,
            (result) => { 
                definitionField.current.value = result;
            }
            )
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
            <button onClick={plecoAction}>Pleco</button>
            <button onClick={translateAction}>Translate</button>
            <button onClick={getJyutping}>Jyutping</button>

            </Container>
        </div>
    );

}

export default EditDictionary;