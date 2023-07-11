
import { dictionaryLookup } from "./backendcall";

import RCDocumentStack from "../../datacomponents/RCDocumentStack"

const localStorageKey ="flashcards";
const failedStorageKey ="failed_flashcards";

let words = {};


let wordFilter = [];


const randomVocab = arr => Math.floor(Math.random() * arr.length);    

window.maxFlashCards = 10000;

// why do I save cards???
const pickWord = ()=> {
    readCardsFromStorage();
    return Object.keys(words)[randomVocab(Object.keys(words))]
}

const invalidateWord = aword => {
    //addTaskDone('flashwordfailed',1,aword);
    console.log('flashwordfailed');
    var failures = null;
    try{
        failures = JSON.parse( localStorage.getItem(failedStorageKey) );
    }
    catch(d) {
        failures = [];
    }
    if (failures == null) 
        failures = [];
    failures.push(aword);
    localStorage.setItem(failedStorageKey, JSON.stringify(failures));
    words[aword] = {
        score: words[aword].score + 2,
        jyutping: words[aword].jyutping,
        definition: words[aword].definition
    }
    saveCardsToStorage();
}

const sizeOfDeck = () => {
    return Object.keys(words).length;
}


const validateWord = aword => {
    words[aword] = {
        score: words[aword].score - 1,
        jyutping: words[aword].jyutping,
        definition: words[aword].definition
    }
    console.log(' score ' + words[aword].score);
    if (words[aword].score < 0) {
        console.log(' delete ' +aword);
        delete words[aword];
    }
    saveCardsToStorage();
}

const clearAllCards = () => {
    if (localStorage.getItem('wordfilter') != null) {
        wordFilter = JSON.parse(  localStorage.getItem('wordfilter'));
    }
    Object.keys(words).forEach(key => delete words[key]);
    saveCardsToStorage();
}

const purgeCards = (text) => {
    /*
    Object.keys(words).forEach(word => {
        if (text.indexOf(word ) == -1)
            delete words[word];
    })
    */
}

const getFailedCards = () => {
    clearAllCards();
    var failures = null;
    try{
        failures = JSON.parse( localStorage.getItem(failedStorageKey) );
    }
    catch(d) {
        failures = [];
    }
    if (failures == null) 
        failures = [];

    if (failures.length == 0)
        return;

    for(var i =0;i< 50;i++) {
        let w = randomVocab(failures);    
        addCardIfNotExist(w);
    }
}


const getDefinitionFlashcard = aword => {
    console.log(aword);
    console.log(words);
    return words[aword].definition;
}

const getJyutpingFlashcard = aword => {
    console.log(aword);
    console.log(words[aword]);
    return words[aword].jyutping;
}

const regetCardFromDictionary = (aword) => {
    dictionaryLookup(aword, (c,j,d) => {
        words[aword] = {
            score: 2,
            jyutping: j,
            definition: d
          }        
    }, () => {} );
}

const setMaxFlashcards = (val) => {
    clearAllCards();
    window.maxFlashCards = val;
}

const saveCardsToStorage = () => {
    let savestring = JSON.stringify(words);
    console.log("Saving words" + words  );
    localStorage.setItem(localStorageKey,savestring);
}

const getWordArray = () => {
    return Object.keys(words);
}

const readCardsFromStorage = () => {
    let savestring = localStorage.getItem(localStorageKey);
    if (savestring !=null ) {
        console.log("reading flashcards");
        let newWords = JSON.parse(savestring);
        console.log(newWords);
        Object.keys(newWords).forEach((key,index) => {
            words[key] = newWords[key];
        });
    }
}

const deleteFromFlash = (word) => {
    delete words[word];
}

const getScoreForCards = () => {
    let totalScore = 0;
    Object.keys(words).forEach(key => totalScore = totalScore + words[key].score);
    console.log('totalScore ' + totalScore);
    return totalScore;
}


const refreshWord = async aword=> {
    dictionaryLookup(aword, (c,j,d) => {
        console.log ('adding found word ' + aword)
        if (Object.keys(words).length >= window.maxFlashCards) 
            return;
        words[aword] = {
            score: 0,
            jyutping: j,
            definition: d
          }
        saveCardsToStorage();        
    }, () => {
        console.log ('adding not found word ' + aword)
        if (Object.keys(words).length >= window.maxFlashCards) 
            return;
        words[aword] = {
            score: 0,
            jyutping: "unknown",
            definition: "unknown"
          }
        saveCardsToStorage();        
    });
}

const addCardIfNotExist = async (entry) => {
    if (!(entry[0] in words)) {
        words[entry[0]] = {
            score: 0,
            jyutping: entry[1],
            definition: entry[2]
          }
    }
}

const addWordIfNotExist = async (aword) => {
    
    if (wordFilter.includes(aword)) {
        return;
    }

    if (!(aword in words)) {
        dictionaryLookup(aword, val => {
            console.log ('adding found word ' + aword + ' ' + val[1] + ' ' + val[2] )
            words[aword] = {
                score: 0,
                jyutping: val[1],
                definition: val[2]
              }        
        }, () => {
            console.log ('adding not found word ' + aword)
            words[aword] = {
                score: 0,
                jyutping: "unknown",
                definition: "unknown"
              }
        });
    }
}

const addToWordFilter = word => {
    wordFilter.push(word);
    localStorage.setItem('wordfilter',JSON.stringify(wordFilter));
}

const notValidWord = word => {
    deleteFromFlash(word);
    addToWordFilter(word);
}

const storeWordListDB = async name  => {
    const response =  await fetch (
        "https://lispworld.eriktamm.com/languageapi/storewordlist",
        {
          method:'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body:JSON.stringify(
            {
                name:name,
                wordlist:words
            })}
      ).then( (response) => response.json());
    console.log(response.result);
}

const getWordListDB = async name => {
    const response =  await fetch (
        "https://lispworld.eriktamm.com/languageapi/getwordlist",
        {
          method:'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body:JSON.stringify(
            {
                name:name                    
            })}
      ).then( (response) => response.json());
    words = response.result;
    console.log(response.result);
}



readCardsFromStorage();

export {getFailedCards,purgeCards,addCardIfNotExist,saveCardsToStorage,refreshWord,getWordListDB,storeWordListDB,notValidWord,addToWordFilter,deleteFromFlash,getWordArray,setMaxFlashcards, getScoreForCards,regetCardFromDictionary,clearAllCards, sizeOfDeck,pickWord,addWordIfNotExist,invalidateWord,validateWord,getDefinitionFlashcard,getJyutpingFlashcard}