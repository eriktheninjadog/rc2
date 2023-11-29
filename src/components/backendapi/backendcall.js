import axios from "axios";


import { addCardIfNotExist, saveCardsToStorage } from "./flashcardengine";

import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate"; // ES Modules import
import { publishCWSArrived } from "../eventsystem/Event";

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


const backEndCallWithCWS = async (endpoint,parameters, errorcallback) => {
    console.log('endpont:' + endpoint);
    console.log(parameters);
    axios.post('https://chinese.eriktamm.com/api/'+endpoint, parameters)
    .then(function (response) {
        console.log(response.data.result);
        publishCWSArrived(response.data.result);
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

const getCwsById = async (cwsid) => {
    backEndCallWithCWS("getcws",
    { cwsid:cwsid},
    (error) => {
        console.log(error);
    });
}

const updateCws = async (cwsid,text,callback) => {
    backEndCall("updatecws",
    { 
        cwsid:cwsid,
        text:text
    },
    callback,
    (error) => {
        console.log(error);
    });
}


const getCharacterCWS = async (title,callback) => {
    backEndCall("get_character_cws",
    { title:title},
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

const hideById = async (cwsid,callback) => {
    backEndCall("changecwsstatus",
    { 
        cwsid:cwsid,
        status:1
    },
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


const grammarBackend = async (cwsid,start,end,successcallback)  => {
    backEndCall("grammartest",
    {
        cwsid:cwsid,
        start:start,
        end:end
    },
    successcallback,(error) => {
        console.log(error);
    }
    );
} 


const testUnderstandingBackend = async (cwsid,start,end,successcallback)  => {
    backEndCall("testunderstanding",
    {
        cwsid:cwsid,
        start:start,
        end:end
    },
    successcallback,(error) => {
        console.log(error);
    }
    );
} 


const testVocabBackend = async (cwsid,start,end,successcallback)  => {
    backEndCall("testvocabulary",
    {
        cwsid:cwsid,
        start:start,
        end:end
    },
    successcallback,(error) => {
        console.log(error);
    }
    );
} 



const getnewsBackend = async (successcallback)  => {
    backEndCall("news",
    {
    },
    successcallback,(error) => {
        console.log(error);
    }
    );
} 


const directAIQuestionsBackend = async (cwsid,questions,start,end,successcallback)  => {
    backEndCall("direct_ai_questions",
    {
        cwsid:cwsid,
        start:start,
        end:end,
        questions:questions
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


const callPoe = async (cwsid,text,bot,clear,successcallback) => {   
    backEndCallWithCWS("poefree",
    {
        cwsid:cwsid,
        text:text,
        bot:bot,
        clear:clear
    }
    );
}

const storeValueOnServer = async (storage,key,value) => {
    backEndCall("set_stored_value",
    {
        storage:storage,
        key:key,
        value:value
    },
    ()=>{

    },(error) => {
        console.log(error);
    }
    );
}

const retrieveValueFromServer = async (storage,key,callback) => {
    backEndCall("get_stored_value",
    {
        storage:storage,
        key:key
    },
    callback
    ,(error) => {
        console.log(error);
    }
    );
}

const extensibleSimplify = async (cwsid,callback) => {
    backEndCall("ai_simplify_cws",
    {
        cwsid:cwsid
    },
    callback
    ,(error) => {
        console.log(error);
    }
    );
}


const extensibleApplyAI = async (cwsid,aitext,callback) => {
    backEndCall("apply_ai",
    {
        cwsid:cwsid,
        aitext:aitext
    },
    callback
    ,(error) => {
        console.log(error);
    }
    );
}


const fakeWiki = async (callback) => {
    backEndCall("ai_summarize_random",
    {
    },
    callback
    ,(error) => {
        console.log(error);
    }
    );
}


const createWordList = async (id,callback) => {
    backEndCall("get_word_list",
    {
        cwsid:id
    },
    callback
    ,(error) => {
        console.log(error);
    }
    );
}

const addlookup = async (cwsid,term,) => {
    backEndCall("add_look_up",
    {
        cwsid:cwsid,
        term:term
    },
    result=>{console.log(result);}
    ,(error) => {
        console.log(error);
    }
    );
}


const lookuphistory = async (cwsid,callback) => {
    backEndCall("get_look_up_history",
    {
        cwsid:cwsid
    },
    callback
    ,(error) => {
        console.log(error);
    }
    );
}

const classify = async (cwsid,callback) => {
    backEndCall("get_classification",
    {
        cwsid:cwsid
    },
    callback
    ,(error) => {
        console.log(error);
    }
    );
}


const getMemoryDevice = async (title,callback) => {
    backEndCall("getmemorystory",
    {
        character:title
    },
    callback
    ,(error) => {
        console.log(error);
    });
}





export  {callPoe,hideById,testUnderstandingBackend,testVocabBackend,getnewsBackend,grammarBackend,getMemoryDevice,updateCws,getCharacterCWS,directAIQuestionsBackend,classify, lookuphistory,addlookup,extensibleApplyAI,createWordList,fakeWiki,extensibleSimplify,retrieveValueFromServer,storeValueOnServer,directAIQuestionBackend,deleteById,explainParagraph,getTestQuestion,amazonTranslateFromChinese,updateDictionary,directAIAnalyze,directAIAnalyzeGrammar,directAISummarize,directAISimplify,localLookup,getCwsVocabulary,dictionaryLookup,getImportedTexts,getCwsById,addQuestions,backEndCall,addTextToBackground,lookUpPosition};