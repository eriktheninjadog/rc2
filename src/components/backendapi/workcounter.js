

let lastWorkTime = new Date().getTime();
let totalWorkTime = 0;

if (localStorage.getItem('totalWorkTime') == undefined) {
    totalWorkTime = 0
} else {
    totalWorkTime = parseInt(localStorage.getItem('totalWorkTime'));
}


let upperCutOff = 240;

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

const clearTotalWorkTime = () => {
    totalWorkTime  = 0;
    localStorage.setItem('totalWorkTime',''+totalWorkTime);    
}


export {addToWorkTime,getTotalWorkTime,clearTotalWorkTime};






