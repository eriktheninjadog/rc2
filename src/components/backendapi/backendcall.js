import axios from "axios";

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


export  {addQuestions,backEndCall,addTextToBackground,lookUpPosition};