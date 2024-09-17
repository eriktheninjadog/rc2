
import axios from "axios";
import {cacheUrl} from '../serviceWorkerRegistration';


const createMP3Filename = (text) => {
    let ret = text.replaceAll(' ','_') +".mp3"
    ret = ret.replaceAll('\n','')
    ret = ret.replaceAll("'","")
    ret = ret.replaceAll("?","")    
    return 'mp3/'+ret
}

const addMP3ToCache = (text) => {
    let filename =createMP3Filename(text);
    cacheUrl(filename);
    console.log('added to cache ' + filename);
}

/** This often fails */
const playMP3background =(file,endCall) => {
    let silentAudioPlayer = document.getElementById('my-invisble-audio');
    silentAudioPlayer.src = file;
    silentAudioPlayer.onended = () => {
        console.log('playMP3background ended');
        endCall();
    };
    silentAudioPlayer.onerror = () =>{
        console.log('playMP3background error');        
        endCall();
    }
    silentAudioPlayer.play();
  } 

//This requires that the mp3 is on the server
  const playTextInBackground =(text,endCall) => {
    if (text === undefined) {
        endCall();
    }
    let file = createMP3Filename(text);
    console.log('playTextInBackground '+ file);
    playMP3background(file,endCall);
  }

export { addMP3ToCache, createMP3Filename ,playMP3background,playTextInBackground}