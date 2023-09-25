

let lastWorkTime = new Date().getTime();
let totalWorkTime = 0;
let totalReadCharacters = 0;

if (localStorage.getItem('totalWorkTime') == undefined) {
    totalWorkTime = 0
} else {
    totalWorkTime = parseInt(localStorage.getItem('totalWorkTime'));
}

if (localStorage.getItem('totalReadCharacters') == undefined) {
    totalReadCharacters = 0
} else {
    totalReadCharacters = parseInt(localStorage.getItem('totalReadCharacters'));
}


let upperCutOff = 120;

const addToWorkTime = () => {
    let now = new Date().getTime()
    let diff = now - lastWorkTime;
    diff = diff / 1000;
    lastWorkTime = now;    
    window.lastWorkTime = lastWorkTime;
    if (diff < upperCutOff) {
        totalWorkTime += diff;
        localStorage.setItem('totalWorkTime',''+totalWorkTime);
    }
}

const getTotalWorkTime = () => {
    return totalWorkTime;
}

const getTotalReadCharacter = () => {
    return totalReadCharacters;
}

const clearTotalWorkTime = () => {
    totalWorkTime  = 0;
    totalReadCharacters = 0;
    localStorage.setItem('totalWorkTime',''+totalWorkTime);    
    localStorage.setItem('totalReadCharacters',''+totalReadCharacters);
}

const addCharactersToWork  = (chars) => {
    totalReadCharacters += chars;
    localStorage.setItem('totalReadCharacters',''+totalReadCharacters);    
}

export {getTotalReadCharacter,addCharactersToWork,addToWorkTime,getTotalWorkTime,clearTotalWorkTime};

