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

    function extractTextBetweenBraces(str) {
        const regex = /{([^}]+)}/g;
        const matches = str.match(regex);
        
        if (matches) {
          return matches.map(match => match.slice(1, -1));
        }
        
        return [];
      }

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
        jyutpingField.current.value = '';
        for (var i=0;i<chi.length;i++) {
            let cha = chi[i];
            dictionaryLookup(''+cha, term=> {
                jyutpingField.current.value = jyutpingField.current.value + ' ' + term[1];
            });
        }
    }

    const extractJyutping = () => {
        jyutpingField.current.value = extractTextBetweenBraces(definitionField.current.value);

    }


    const mdbgAction = () => {
        /*
        "/editdictionary?term="+modalheading
        */
        let url = 'https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=1&wdqb='+ encodeURI(chineseField.current.value);
        window.open(url)
    }

    const plecoAction = () => {
        /*
        "/editdictionary?term="+modalheading
        */
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
            <Navigation></Navigation><br></br>
            {
                searchParams.get('term').split('').map( (name, index)=>{
                    return <a href= {"/editdictionary?term=" + name}>{name}</a>
                }  )

            }                
            <br></br>
            <input type="text" size="30" ref={chineseField} ></input><br></br>
            <input type="text" size="30" ref={jyutpingField}></input><br></br>
            <textarea ref={definitionField} rows={15} cols={30}>
            </textarea><br></br>
            <button onClick={update}>Post</button><br></br>
            <button onClick={plecoAction}>Pleco</button>
            <button onClick={mdbgAction}>mdbg</button>

            <button onClick={translateAction}>Translate</button>
            <button onClick={getJyutping}>Jyutping</button>
            <button onClick={extractJyutping}>Extract Jyutping</button>
            </Container>
        </div>
    );

}

export default EditDictionary;