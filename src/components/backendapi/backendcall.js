import axios from "axios";


import { addCardIfNotExist, saveCardsToStorage } from "./flashcardengine";

const backEndCall = async (endpoint,parameters,successcallback, errorcallback) => {
console.log('endpont:' + endpoint);
console.log(parameters);
axios.post('https://chinese.eriktamm.com/api/'+endpoint, parameters)
  .then(function (response) {
    successcallback(response.data.result)
  })
  .catch(function (error) {
    errorcallback(error)
  });
}



const dictionaryLookup = (aword,callback)=> {
    backEndCall("dictionarylookup",
    {
        "word":aword
    },
    callback,
    (error) => {
        console.log(error);
    });    
}

const updateDictionary = (chinese,jytuping,definition) =>{

}

const localLookup = word => {
    let ret = []
    if (localStorage.getItem('localdict') == undefined) {
        return []
    }
    var tmp = localStorage.getItem('localdict');
    tmp = JSON.parse(tmp);
    tmp.forEach( element =>
        {
            if (element[0].indexOf(word) != -1)
                ret.push(element)
        });
    return ret;
}

const getCwsVocabulary = (cwsid)=> {
    backEndCall("get_cws_vocabulary",
    {
        cwsid:cwsid
    },
    data => {
        console.log(data);
        localStorage.setItem('localdict',JSON.stringify(data));
        window.localDictionary = data;
        data.forEach(element => {
            addCardIfNotExist(element);
            saveCardsToStorage();
        });
    },
    (error) => {
        console.log(error);
    });    
}

const getCwsById = async (cwsid,callback) => {
    backEndCall("getcws",
    { cwsid:cwsid},
    callback,
    (error) => {
        console.log(error);
    });
}

const lookUpPosition = async (cwsid,position,succecallback) => {
    backEndCall("lookupposition",
    {   
        cwsid:cwsid,
        position:position
    }, 
    succecallback,(error) => {
        console.log(error);
    });
}


const getImportedTexts = async (callback) => {
    backEndCall("getimportedtexts",
    {   
    }, 
    callback,(error) => {
        console.log(error);
    });
}

const addQuestions = async (cwsid,succecallback) => {
    backEndCall("generatequestions",
    {   
        cwsid:cwsid
    }, 
    succecallback,(error) => {
        console.log(error);
    });
}


const addTextToBackground = async (title,source,body,parentCwsId,succecallback) => {
    
    backEndCall("addtext",
    {
        text:body,
        title:title,
        source:source,
        parentcwsid:parentCwsId
    }, succecallback,(error) => {
        console.log(error);
    }
    );
}

const directAIAnalyze = async (cwsid,fragment,successcallback)  => {
    backEndCall("direct_ai_analyze",
    {
        cwsid:cwsid,
        fragment:fragment
    },
    successcallback,(error) => {
        console.log(error);
    }
    );
} 

const directAIAnalyzeGrammar = async (cwsid,fragment,successcallback)  => {
    backEndCall("direct_ai_analyze_grammar",
    {
        cwsid:cwsid,
        fragment:fragment
    },
    successcallback,(error) => {
        console.log(error);
    }
    );
} 

const directAISummarize = async (cwsid,fragment,successcallback)  => {
    backEndCall("direct_ai_summarize",
    {
        cwsid:cwsid,
        fragment:fragment
    },
    successcallback,(error) => {
        console.log(error);
    }
    );
} 


const directAISimplify = async (cwsid,fragment,successcallback)  => {
    backEndCall("direct_ai_simplify",
    {
        cwsid:cwsid,
        fragment:fragment
    },
    successcallback,(error) => {
        console.log(error);
    }
    );
} 


export  {updateDictionary,directAIAnalyze,directAIAnalyzeGrammar,directAISummarize,directAISimplify,localLookup,getCwsVocabulary,dictionaryLookup,getImportedTexts,getCwsById,addQuestions,backEndCall,addTextToBackground,lookUpPosition};