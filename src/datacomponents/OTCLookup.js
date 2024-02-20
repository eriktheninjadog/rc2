
import otcdata from './fulldict.json'



const findCharactersWithComponent = (comp) => {
    let res = []
    for (let k in window.otcdata) {
        let obj = window.otcdata[k];
        if (obj['components'].length != 0) {
            if (comp in obj['components']) {
                res.push(k);
            }
        }
    }
    return res;
}

const lookupOTC = (char) => {
    if (window.otcdata === undefined)
        window.otcdata = otcdata;

    console.log(' length ' + Object.keys(window.otcdata).length);
    console.log(' sample *'+Object.keys(window.otcdata)[10] +'*');
    if (char in window.otcdata) {
        console.log('Found it!!!');
        return window.otcdata[char];        
    }
    return null;
}

export {lookupOTC,findCharactersWithComponent};