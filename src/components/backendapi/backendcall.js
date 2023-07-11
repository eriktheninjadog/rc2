import axios from "axios";


import { addCardIfNotExist, saveCardsToStorage } from "./flashcardengine";

import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate"; // ES Modules import



const backEndCall = async (endpoint,parameters,successcallback, errorcallback) => {
    console.log('endpont:' + endpoint);
    console.log(parameters);
    axios.post('https://chinese.eriktamm.com/api/'+endpoint, parameters)
    .then(function (response) {
        console.log(response.data.result);
        successcallback(response.data.result)
    })
    .catch(function (error) {
        errorcallback(error)
    });
}



const amazonTranslateFromChinese = (chinesetext,callback) => {
    backEndCall("translatechinese",
    {
        "text":chinesetext
    },
    callback,
    (error) => {
        console.log(error);
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

const updateDictionary = (chinese,jyutping,definition,callback) =>{
    backEndCall("update_dictionary",
    {
        term:chinese,
        jyutping:jyutping,
        definition:definition
    },
    callback,
    (error) => {
        console.log(error);
    });
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


const deleteById = async (cwsid,callback) => {
    backEndCall("deletecws",
    { cwsid:cwsid},
    callback,
    (error) => {
        console.log(error);
    });
}

const getTestQuestion = async (callback) => {
    backEndCall("get_a_problem_text",
    {},
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

const directAIAnalyze = async (cwsid,p1,p2,successcallback)  => {
    backEndCall("direct_ai_analyze",
    {
        cwsid:cwsid,
        p1:p1,
        p2:p2
    },
    successcallback,(error) => {
        console.log(error);
    }
    );
} 

const directAIAnalyzeGrammar = async (cwsid,p1,p2,successcallback)  => {
    backEndCall("direct_ai_analyze_grammar",
    {
        cwsid:cwsid,
        p1:p1,
        p2:p2
    },
    successcallback,(error) => {
        console.log(error);
    }
    );
} 

const directAISummarize = async (cwsid,p1,p2,successcallback)  => {
    backEndCall("direct_ai_summarize",
    {
        cwsid:cwsid,
        p1:p1,
        p2:p2
    },
    successcallback,(error) => {
        console.log(error);
    }
    );
} 


const directAISimplify = async (cwsid,p1,p2,successcallback)  => {
    backEndCall("direct_ai_simplify",
    {
        cwsid:cwsid,
        p1:p1,
        p2:p2
    },
    successcallback,(error) => {
        console.log(error);
    }
    );
} 


const directAIQuestionBackend = async (cwsid,question,start,end,successcallback)  => {
    backEndCall("direct_ai_question",
    {
        cwsid:cwsid,
        start:start,
        end:end,
        question:question
    },
    successcallback,(error) => {
        console.log(error);
    }
    );
} 


const explainParagraph = async (cwsid,para) => {

    backEndCall("explain_paragraph",
    {
        cwsid:cwsid,
        text:para
    },
    ()=>{
        console.log("explainParagraph success")
    },(error) => {
        console.log(error);
    }
    );
}

export  {directAIQuestionBackend,deleteById,explainParagraph,getTestQuestion,amazonTranslateFromChinese,updateDictionary,directAIAnalyze,directAIAnalyzeGrammar,directAISummarize,directAISimplify,localLookup,getCwsVocabulary,dictionaryLookup,getImportedTexts,getCwsById,addQuestions,backEndCall,addTextToBackground,lookUpPosition};