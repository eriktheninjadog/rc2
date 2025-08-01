
import axios from "axios";


import React, { startTransition, useState ,useRef,useEffect} from 'react';
import Navigation from './Navigation';


import { tokenizeChinese } from "./backendapi/backendcall";
import { SRTParser } from "./srtparser";


import IntelligentText from './IntelligentText';


import {addSentence,removeAudio,addListenedTo,addMP3ToServer,getArticleAudioExample,createexamples,getAudioExample,getTotalOutputTime,getTotalAudioTime, callPoeWithCallback,addAudioTimeToBackend,callPoe,getExampleResult, getexamples,writeExampleResult, addOutputExercise, backEndCall} from "./backendapi/backendcall"

import { addMP3ToCache,playMP3background,playTextInBackground } from './mp3lib';



import { ActivityTimeManager } from "./ActivityManager";
import { getActivityTimer } from "./ActivityTimer";
import { set } from "local-storage";


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;


const createSequencePlayer = (audioRef) => {
  let startPoint = null;
  let endPoint = null;
  let isLooping = false;

  // Function to handle sequence button click
  const handleSequenceClick = () => {
    const audio = audioRef.current;
    
    if (!startPoint) {
      // First click: set start point
      startPoint = audio.currentTime;
      return "Start point set";
    } else if (!endPoint) {
      // Second click: set end point and start looping
      endPoint = audio.currentTime;
      
      // Make sure start is before end
      if (startPoint > endPoint) {
        [startPoint, endPoint] = [endPoint, startPoint];
      }
      
      isLooping = true;
      
      // Add timeupdate listener to handle looping
      audio.addEventListener('timeupdate', checkTime);
      return "Looping enabled";
    } else {
      // Third click: release the loop
      releaseLoop();
      return "Loop released";
    }
  };

  // Function to check if video needs to loop back
  const checkTime = () => {
    const audio = audioRef.current;
    if (isLooping && audio.currentTime >= endPoint) {
      audio.currentTime = startPoint;
    }
  };

  // Function to manually set loop points
  const setLoopPoints = (start, end) => {
    // Validate the inputs
    if (typeof start !== 'number' || typeof end !== 'number') {
      console.error('Start and end points must be numbers');
      return false;
    }
    
    if (start < 0 || end < 0) {
      console.error('Time points cannot be negative');
      return false;
    }
    
    if (start >= end) {
      console.error('Start time must be less than end time');
      return false;
    }
    
    // Set the loop points
    startPoint = start;
    endPoint = end;
    isLooping = true;
    
    // Add timeupdate listener if it's not already added
    const audio = audioRef.current;
    audio.removeEventListener('timeupdate', checkTime); // Remove first to avoid duplicates
    audio.addEventListener('timeupdate', checkTime);
    
    return true;
  };

  // Function to release the loop
  const releaseLoop = () => {
    const audio = audioRef.current;
    audio.removeEventListener('timeupdate', checkTime);
    startPoint = null;
    endPoint = null;
    isLooping = false;
  };

  return { handleSequenceClick, releaseLoop,setLoopPoints };
};


const OutputTraining = () => {


  const audioRef = useRef(null);


  const sequencePlayer = useRef(createSequencePlayer(audioRef));
  const [sequenceStatus, setSequenceStatus] = useState("");
      
  

  const [currentFile,setCurrentFile] = useState('');


    const currentSentence=(tokenInSentence)=> {
      let start = tokenInSentence;
      let str = '';
      while ((start > 0) && (tokens[start]!='？'&&tokens[start]!='！'&&tokens[start]!='。'  )) {
        start--;
      }
      let end = tokenInSentence;
      while ((end < (tokens.length-1)) && (tokens[end]!=='？'&&tokens[end]!=='！'&&tokens[end]!=='。' )) {
        //console.log(tokens[end]);
        end++;
      }
      
      if (extendedTokens != null) {
        window.startSentenceTime = extendedTokens[start].start_time-0.2;
        window.endSentenceTime = extendedTokens[end].end_time;
      }

      for (let i = start; i<end;i++) {
        str = str + tokens[i]
      }
      return str;
    }


    const lookupMark = () => {
      if (window.playMark == undefined)
        return;
      if (window.playMark == null)
        return;
      if (window.repeatMark == undefined)
        return;
      if (window.repeatMark == null)
        return;
      if (extendedTokens == null)
        return;
      let startidx = -1;
      for(var i =0;i<extendedTokens.length;i++) {
          if (extendedTokens[i]['start_time'] >= window.playMark ) {
            startidx = i;
            break;
          }
      }
      let endIdx = -1;
      for(var i =0;i<extendedTokens.length;i++) {
          if ( extendedTokens[i]['end_time'] >= window.repeatMark) {
            endIdx = i;
            break;
          }
      }
      console.log(' startidx ' + startidx + ' ' + endIdx)
      let orgtxt = '';
      for (var i=startidx;i<endIdx;i++) {
        orgtxt = orgtxt + tokens[i];
      }
      callPoeWithCallback(-1,"Explain this sentence,grammar and vocab using English. Include English translation between <enspeak>" + ' : ' + orgtxt,'Claude-3-Opus','Claude-3-Opus',result=>{
        let txt = '';
        let tkns = result[3];
        // set the text to be spoken
          for (var i=0;i< tkns.length;i++) {
            if (tkns[i] == '\n') {
              txt= txt + '<br/>';
            } else
              txt = txt + tkns[i];
          }
          audioRef.current.pause();
        window.displayDialog(orgtxt,txt);
      },
      error=>{
        console.log(error);
      }
      );
    }


    const lookupSentence = () => {
      let theone = window.chosentoken;
      console.log(theone);
      // backtrack
      let str = currentSentence(theone);
      if (str == undefined)
        return;
      if (window.startSentenceTime != undefined || window.startSentenceTime != null) {
        window.playMark = window.startSentenceTime;
        window.repeatMark =  window.endSentenceTime;

      }
      callPoeWithCallback(-1,"Explain this sentence,grammar and vocab using English. Include English translation between <enspeak>" + ' : ' + str,'Claude-3-Opus','Claude-3-Opus',result=>{
        let txt = '';
        let tkns = result[3];
        // set the text to be spoken
          for (var i=0;i< tkns.length;i++) {
            if (tkns[i] == '\n') {
              txt= txt + '<br/>';
            } else
              txt = txt + tkns[i];
          }
          audioRef.current.pause();
        window.displayDialog(str,txt);
      },
      error=>{
        console.log(error);
      }
      );
    };


    const lookupAll = () => {
      let theone = window.chosentoken;
      // Create a string by combining all tokens
      let str = tokens.join('');
      audioRef.current.pause();
      callPoeWithCallback(-1,"Explain this sentence,grammar and vocab using Cantonese. Include English translation between <enspeak>" + ' : ' + str,'Claude-3-Opus','Claude-3-Opus',result=>{
        let txt = '';
        let tkns = result[3];
        // set the text to be spoken
          for (var i=0;i< tkns.length;i++) {
              txt = txt + tkns[i];
          }
          tokenizeChinese(txt, (result) => {
            if (result == null) {
              console.log("No tokens");
              setTokens(["no tokens"]);
            } else {
              setTokens(result);
            }
          });        
//        window.displayDialog(str,txt);
      },
      error=>{
        console.log(error);
      }
      );
    };

    
    const [state, setState] = useState('state1');
    const [question,setQuestion] = useState('This is the sentence');
    const [chinese,setChinese] = useState('This is the chinese');
    const [tokens,setTokens] = useState([]);
    const [extendedTokens,setExtendedTokens] = useState(null);
    
    const [times,setTimes] = useState(null);
    const [pickedQuestionId,setPickedQuestionId] = useState(-1);
    const [chosenLevel,setChosenLevel] = useState('');
    const [chosenNumber,setChosenNumber] = useState(10);
    const [totalTimeString,setTotalTimeString] = useState('');
    const intelligentTextRef = useRef(null);
    const correctedEnglish = useRef(null);
    const addStuffArea = useRef(null);
    


    const [playbackRate, setPlaybackRate] = useState(1);
    const handleSpeedChange = (speed) => {
      setPlaybackRate(speed);
      audioRef.current.playbackRate = speed;
    };

    /** Control commands exposed on window */

    window.repeatEvent = () => {
      console.log('repeatEvent');
      goBack(5);  
    }


    window.startEvent = () => {
      console.log('startEvent');
      audioRef.current.play();
    }

    window.pauseEvent = () => {
      console.log('pauseEvent');
      audioRef.current.pause();
    }

    window.refEvent = () => {
      console.log('refEvent');
      getRandomAudioExample();
    }
  
    window.markEvent = () => {
      console.log('markEvent');
      setMark(null);
    }

    window.goEvent = () => {
      console.log('goEvent');
      goMark(null);
    }

    window.lookupSentenceEvent = () => {
      console.log('lookupSentence');
      lookupSentence();
    }
    

    const pickRound = (newRound) => {
        let baloba = pickedQuestionId + 1;
        if (newRound)
          baloba = 0;
        if (baloba >= window.gamedatabase.length) {
            baloba = window.gamedatabase.length-1   ;
        }
        setPickedQuestionId(baloba);
        setQuestion(window.gamedatabase[baloba].english);
        setChinese(window.gamedatabase[baloba].chinese);
        window.questionStart = Date.now();
        let clearChinese = '';
        for(var i=0;i<window.gamedatabase[baloba].tokens.length;i++) {
          clearChinese = clearChinese + window.gamedatabase[baloba].tokens[i];          
        }
        window.clearChinese = clearChinese;
    } 

    const magicLookup = async () => {
      let selection = window.getSelection().toString();
      if (selection.length === 0) {
      
        // If no text is selected, try to get text from clipboard
        try {
          const clipboardText = await navigator.clipboard.readText();
          if (clipboardText) {
            // Use the clipboard text as selection
            selection = clipboardText;
          } else {
            // Handle empty clipboard case
            console.log("No text selected and clipboard is empty");
            return;
          }
        } catch (err) {
          console.error("Failed to read clipboard contents: ", err);
          return;
        }
      }


      callPoeWithCallback(-1,"Explain this sentence,grammar and vocab using English" + ' : ' + selection,'Claude-3-Opus','Claude-3-Opus',result=>{
        console.log(result);
        console.log(intelligentTextRef);  

        let txt = '';
        let tkns = result[3];
        // set the text to be spoken
          for (var i=0;i< tkns.length;i++) {
            if (tkns[i] == '\n') {
              txt= txt + '<br/>';
            } else
              txt = txt + tkns[i];
          }   
        window.displayDialog(selection,txt);
      },
      error=>{
        console.log(error);
      }
      );
    }


    const translatePage = () => {
      let alltext = document.getElementById('iqtextid').innerText;
      callPoeWithCallback(-1,"Translate this text to English  : " + alltext,'Claude-3-Opus','Claude-3-Opus',result=>{
        console.log(result);
        console.log(intelligentTextRef);  

        let txt = '';
        let tkns = result[3];
        // set the text to be spoken
          for (var i=0;i< tkns.length;i++) {
            if (tkns[i] == '\n') {
              txt= txt + '<br/>';
            } else
              txt = txt + tkns[i];
          }   
        window.displayDialog("Whole page",txt);
      },
      error=>{
        console.log(error);
      }
      );
    }

  const createSentences = () => {
  // Get tokens and convert to text
      let mytokens = tokens;
      let txt = mytokens.join('');
      let tmpquestion = '';
      const selectedText = window.getSelection().toString() || correctedEnglish.current.value;
      const createFormat = document.getElementById('createFormat').value;

      // Build question based on format
      if (!createFormat.includes('[SELECTED]')) {
        // Use selected text if available, otherwise use full text
        const textToUse = selectedText.length > 0 ? selectedText : txt;
        tmpquestion = `${createFormat} : ${textToUse}. Return these together with english translation in json format like this: [{"english":ENGLISH_SENTENCE,"chinese":CANTONESE_TRANSLATION}].Only respond with the json structure.`;
      } else {
        // Replace [SELECTED] placeholder with selected text
        tmpquestion = `${createFormat.replace('[SELECTED]', selectedText)}. Return these together with english translation in json format like this: [{"english":ENGLISH_SENTENCE,"chinese":CANTONESE_TRANSLATION}].Only respond with the json structure.`;
            }

    // Create examples and add to database
      createexamples(tmpquestion, 'A1', result => {
        const baba = result;
        const gdb = window.gamedatabase;

        baba.forEach(example => {
          // Add each example to exercises
          addOutputExercise(
            example.english,
            JSON.stringify(example.chinese),
            chosenLevel,
            2,
            1,
            0,
            Date.now(),
            result => {}
        );

      gdb.push({
        tokens: example.chinese,
        english: example.english
      });
    });
    window.gamedatabase = gdb;
    changeState('showquestion')
  });
};

    const startRound = ()=> {
        console.log('startRound');
        if (getActivityTimer().isRunning())
          getActivityTimer().pause();
        getActivityTimer().start('reading');
        window.changeBot = false;
        let level = document.getElementById('level').value;
        setChosenLevel(level);
        setPickedQuestionId(-1);
        getexamples(level,parseInt(chosenNumber),isOnlyFailedChecked, result => {
            let baba = result;
            console.log(baba);
            let gdb = [];                
            for(var i =0 ; i < baba.length;i++) {
                gdb.push( {tokens:baba[i]['chinese'],english:baba[i]['english'] }   )
            }
            window.gamedatabase = gdb;
            changeState('showquestion');
            setPickedQuestionId(-1);
            pickRound(true);
        }
        );
    }

    const addTheStuff = (event) => {
      console.log(event);
      let lines = addStuffArea.current.value.split("\n");
      console.log(lines);
      for (var i=0;i<lines.length;i+=2) {
          let mylines = lines;
          let chinese = mylines[i];
          let english = mylines[i+1];
          setTimeout(()=>{
          addOutputExercise(english,JSON.stringify([chinese]),chosenLevel,2,1,0,Date.now(), result => {});
        },i*500 );
      }
    }

    const addMP3 = (event) => {
      console.log(event);
      addMP3ToServer(addStuffArea.current.value);    
    }
    
    const showAnswer = ()=> {
        setTokens(window.gamedatabase[pickedQuestionId].tokens);
        changeState('showanswer');
    }
 
    const success = ()=> {
      getActivityTimer().heartbeat();
      let amountTime =  Date.now() - window.questionStart;  
      pickRound(false);

        if (document.getElementById('whyfail').value.length > 0 ) {
          addOutputExercise(question,JSON.stringify([document.getElementById('whyfail').value]),chosenLevel,2,0,amountTime,Date.now(), result => {});
        }
        addOutputExercise(question,JSON.stringify(tokens),chosenLevel,2,0,amountTime,Date.now(),result => {} );
        changeState('showquestion')
    }

    const kill = ()=> {
      pickRound(false);
      changeState('showquestion')
    }

    const failure = ()=> {
      getActivityTimer().heartbeat();      
      let amountTime =  Date.now() - window.questionStart;
      pickRound(false);      
      let newEnglish = question;
      if (correctedEnglish.current.value.length > 0) {
        newEnglish = correctedEnglish.current.value;
        correctedEnglish.current.value = '';
        window.gamedatabase[pickedQuestionId].english = newEnglish;
      }

      window.gamedatabase.push(window.gamedatabase[pickedQuestionId]);
      if (document.getElementById('whyfail').value.length > 0 ) {
        window.gamedatabase.push({tokens:[document.getElementById('whyfail').value],newEnglish: question +' {corrected} '});
        addOutputExercise(newEnglish,JSON.stringify([document.getElementById('whyfail').value]),chosenLevel,2,1,amountTime,Date.now(),result => {} );
      }
      addOutputExercise(newEnglish,JSON.stringify(tokens),chosenLevel,2,1,amountTime,Date.now(),result => {} );
      changeState('showquestion')
    }

    const freeai = () => {

      let bot = document.getElementById('bot').value;      
      callPoeWithCallback(-1,document.correctedEnglish.current.value,bot,window.changeBot,result=>{
        console.log(result);
        console.log(intelligentTextRef);  

        let txt = '';
        let tkns = result[3];
        // set the text to be spoken
          for (var i=0;i< tkns.length;i++) {
            if (tkns[i] == '\n') {
              txt= txt + '<br/>';
            } else
              txt = txt + tkns[i];
          }   
        window.displayDialog('hi there',txt);
      },
      error=>{
        console.log(error);
      }
      );
    }

    const explain = ()=> {
      let txt = '';
      let mytokens = window.gamedatabase[pickedQuestionId].tokens;
      // set the text to be spoken
      for (var i=0;i< mytokens.length;i++) {
        txt = txt + mytokens[i];
      }
      backEndCall('explain_sentence',{'sentence':txt},result=>{
        console.log(result);
        let txt = '';
        let tkns = result;
        // set the text to be spoken
          for (var i=0;i< tkns.length;i++) {
            if (tkns[i] == '\n') {
              txt= txt + '<br/>';
            } else
              txt = txt + tkns[i];
          }
        //window.displayDialog('hi there',txt);
        setTokens(result);
      },
      error=>{
        console.log(error);
      }
      );
    }
    


    function formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');
      
      return `${formattedHours}:${formattedMinutes}`;
    }

    const showStatistics = ()=> {
            const apiManager = new ActivityTimeManager('https://chinese.eriktamm.com/api');
            let readingTime = 0;
            let listeningTime = 0;
            let writingTime =  0;
              apiManager.getAccumulatedTime("reading").then( rt => {
                readingTime = rt['accumulated_time'];;
                console.log("Reading time: " + readingTime);
                listeningTime = apiManager.getAccumulatedTime("listening").then(lt => {
                  listeningTime = lt['accumulated_time'];;
                  console.log("listening time" + listeningTime);
                  writingTime = apiManager.getAccumulatedTime("writing").then(wt => {
                    writingTime = wt['accumulated_time'];
                    console.log("writing time" + writingTime);
                    setTotalTimeString("Reading " + formatTime(readingTime/1000) + " Writing " + formatTime(writingTime/1000 ) +" listening " + formatTime(listeningTime/1000  ));
                    setState('statistics');
                  });
                });
              });
          }

        
    const changeState = (newState) => {
        setState(newState);
    };

  const [isReadMode, setIsReadMode] = useState(false);

  const [isOnlyFailedChecked, setIsOnlyFailedChecked] = useState(false);

  const handleOnlyFailedCheckboxChange = (event) => {
    setIsOnlyFailedChecked(event.target.checked);
  };


  const handleOReadmodeCheckboxChange  = (event) => {
    setIsReadMode(event.target.checked);
  };


  const  showMP3 = (event) => {
    backEndCall('getspokenarticles',{},
    result => {
      getActivityTimer().pause();
      getActivityTimer().start('listening');
      window.mp3files = result;
      setState('pickmp3');
    },
    error => {}
    )
  }

  const pickAMP3=(event) => {
    getActivityTimer().pause();
    getActivityTimer().start('listening');

    backEndCall('getspokenarticle',
    {'mp3file':event.target.innerText,'next':false},
    result => {
      window.currentSentences = result['tokens'];
      setTokens(result['tokens']);
      setExtendedTokens(result['extendedtokens']);
            
      if (result['srtpath'] != null)
      {
        const audioBasename = result['filepath'].split('/').pop().replace(/\.[^/.]+$/, '');
        window.srtParser=new SRTParser("https://chinese.eriktamm.com/watchit/"+ audioBasename +".srt");
        window.srtParser.fetchSRT();
      } else {
        window.srtParser = null;
      }
      audioRef.current.src = 'mp3/' +result['filepath'];
      setState('statistics');
    });
  }

  const getRandomAudioExample = () => {
    window.currentSentences = null;
    window.lastLastSentenceStartAt = 0;
    window.lastSentenceStartTime = 0;
    getAudioExample(result=> {    
      window.currentSentences = result['tokens'];
      setTokens(result['tokens']);
      audioRef.current.src = 'mp3/' +result['filepath'];
      setCurrentFile(result['filepath']);
      audioRef.current.play();
      console.log(result['times']);
      if (result['times'] != null) {
        for (var i=0;i < result['times'].length;i++) {
          let english = result['times'][i][1];
          addMP3ToCache(english);
        }
        setTimes(result['times']);
      } else {
        setTimes(null);
      }
    })
  }

  const refreshAudio =  (event) => {
    
    window.refreshAudioClicked = true;
    window.ignoreEnglish = true;

    //addListenedToFromAudio();
    getRandomAudioExample();
    //addKeyHandler
  }

  const mykeyhandler = (key) => {

    let backKeys = ['`','1','2','3','4','5'];
    let engKeys = ['6','7','8','9','0','-','+'];

    let startKeys = ['a','s','d','f','g'];
    let pauseKeys = ['h','j','k','l',';','\''];

    for (let i=0;i<backKeys.length;i++) {
      if (key == backKeys[i]) {
        goBack(5);  
      }
    }


    for (let i=0;i<startKeys.length;i++) {
      if (key == startKeys[i]) {
        audioRef.current.play();
      }
    }

    for (let i=0;i<pauseKeys.length;i++) {
      if (key == pauseKeys[i]) {
        audioRef.current.pause();
      }
    }
  }


  window.startEvent = ()=> {
    audioRef.current.play();
  }

  window.repeatEvent = ()=> {
    goBack(5);
  }



  const setMark = (event) => {
    window.playMark = window.currentPlayTime;
  }

  const goMark = (event) => {
    if (window.repeatMark == undefined || window.repeatMark == null ) {
      window.repeatMark = audioRef.current.currentTime;
    } else {
      window.repeatMark = null;
    }
  }



  const onAudioEnded = (event) => {

    
    window.timer.pause();
    audioRef.current.pause();
    if ( document.getElementById('loopCheckbox').checked) {
      setTimeout(()=> {
          audioRef.current.play();
          window.timer.start();
      }
      ,
      2000);      
      return;
    }
    if ( document.getElementById('autoKillCheckbox') != undefined && document.getElementById('autoKillCheckbox').checked) {
        let file = audioRef.current.src;
        let fileparts = file.split('/');
        file = fileparts[fileparts.length-1];
        removeAudio(file,()=>{});
    }
    
    if ( window.refreshAudioClicked ) {
      getRandomAudioExample();
      return;
    }

    if ( document.getElementById('nextCheckbox').checked) {

      const path = audioRef.current.src.split('/').pop();
      // Remove any query parameters
      let file =  path.split('?')[0];
  
      backEndCall('getspokenarticle',
      {'mp3file':file,'next':true},
      result => {   
        window.currentSentences = result['tokens'];
        setTokens(result['tokens']);  
        setExtendedTokens(result['extendedtokens'])
        audioRef.current.src = 'mp3/' +result['filepath'];
        setState('statistics');
        setTimeout(() => {
          audioRef.current.play();
        } ,3000);
      });
    }
  }



  
  const calculateTokenFromTime = (currentTime,totalTime) => {
    let chosentoken =  Math.round(tokens.length*(currentTime / totalTime));
    let found = -1;
    if (extendedTokens != null) {
      for (var i=0; i <extendedTokens.length;i++) {
        let d = extendedTokens[i];
        let start_time = d['start_time'];
        let end_time = d['end_time'];
        //console.log( ' ' + currentTime + "   " + start_time  + '  ' + end_time)        
        if (currentTime >= start_time && currentTime <= end_time) {
          found = i;
          break
        }
      }
    }    
    if ( found != -1)
      return found;
    return chosentoken;
  }

  const loadSubtitle = () => {
    console.log('loadSubtitle ');

    let subtitle = audioRef.current.src + '.subtitle'
    console.log( subtitle);

    axios.get(subtitle)
    .then(function (response) {
      audioRef.current.subtitle = response.data
    })
    .catch(function (error) {
      alert(error);
        //errorcallback(error)
    });

  }

  const updateSubtitles = (currentTime, subtitle) => {
    if (!subtitle) return '';
    
    let txt = '';
    for (let i = 0; i < subtitle.length; i++) {
      if (subtitle[i][0] < currentTime) {
        txt = subtitle[i][1];
      }
    }
    return txt;
  }


   const handleSRTTimeUpdate = (time) => {
       getActivityTimer().heartbeat();
       window.timer.start();
       let subtitle = null;

          let mytime = audioRef.current.currentTime;
          let secs = parseFloat(mytime);  
          subtitle = window.srtParser.getSRT(secs);
          window.subtitle = subtitle;
          const cacheKey = `tokenize_${subtitle}`;
          if (subtitle == null) {
            console.log("No SRT");
            let msg = 'Current play time: '+mytime+' seconds'
            setTokens([msg]);
          }
          else{
            console.log(subtitle);
            const cachedTokens = localStorage.getItem(cacheKey);
              if (cachedTokens) {
                  setTokens(JSON.parse(cachedTokens));
                  return;
              }
            
            tokenizeChinese(subtitle,(result) => {
              if  (result == null) {
                console.log("No tokens");
                setTokens(["no tokens"]);
              } else {
                localStorage.setItem(cacheKey, JSON.stringify(result));             
                setTokens(result);
              }
            });
            setTokens([subtitle]);
          }
         };

  const handleTimeUpdate = (event) => {
    getActivityTimer().heartbeat();
    let now = Date.now();
    if (window.srtParser !==  null) {
      handleSRTTimeUpdate(event.target.currentTime);
      return;
    }

    window.currentPlayTime  = event.target.currentTime;

    if (window.repeatMark != undefined && window.repeatMark != null) {
      if (window.repeatMark < event.target.currentTime) {
        event.target.currentTime = window.playMark;
      }
    }
    
   if (audioRef.current.subtitle != undefined) {
      const txt = updateSubtitles(event.target.currentTime, audioRef.current.subtitle);
      if (txt.length != tokens.length) {
        setTokens(txt);
      }
    }

    let timePassed = now - window.lastTime;

    let chosentoken =  calculateTokenFromTime(event.target.currentTime,event.target.duration);    
    window.chosentoken = chosentoken;

    if (document.getElementById('tokenid' +chosentoken ) != undefined) {
      document.getElementById('tokenid' +chosentoken ).style.backgroundColor = 'grey';
    }

    if (document.getElementById('tokenid' +(chosentoken-1) ) != undefined) {
      document.getElementById('tokenid' +(chosentoken-1) ).style.backgroundColor = 'white';
    }

    //Lets check if we are speaking english
    console.log(window.lastEnglishStartsAt);
    console.log(window.currentPlayTime);

    if ((window.currentPlayTime > window.lastEnglishStartsAt )&& window.ignoreEnglish) {
      audioRef.current.currentTime = window.nextSentenceStartAt;
    }
    window.timer.start();
     window.lastTime = Date.now();
  };

  const startManualTime = event => {
    window.timer.start();
  }

  const stopManualTime = event => {
    window.timer.pause();
  }

  const handleStartPlay = (event) => {
    getActivityTimer().start('listening');
    console.log('handleStartPlay');
    window.combinedTime = 0;
    window.lastTime = Date.now();
 };

 const goBack = (amount) => {
  audioRef.current.currentTime = audioRef.current.currentTime - (amount);
 };

 window.settokens = (toks) => {
  console.log('settokens');
  setTokens(toks);  
 }

 const moveToNextSub = ()=> {
  //sequencePlayer.current.handleSequenceClick
  let times = window.srtParser.getNextSRT(audioRef.current.currentTime);
  let newtime = times[0];
  sequencePlayer.current.setLoopPoints(newtime-0.5, times[1]+0.5); 
  audioRef.current.currentTime = newtime;
 }


  return (
        <container>
    <Navigation></Navigation>
    <div>
      <div>
        <br></br>
        <br></br>
        <br></br>        
        <button onClick={() => changeState('inputlevel')}>Inputlevel</button>
        <button onClick={() => changeState('showquestion')}>showquestion</button>
        <button onClick={() => changeState('showanswer')}>sa</button>
        <button onClick={() => showMP3()}>mp3</button>        
        <button onClick={() => showStatistics()}>stat</button>        
      </div>
      <div>
        {state === 'inputlevel' && (
          <div>
            <h2>Start Test</h2>
            <div class="form-group">
            <label for="level">Level</label><select id = "level">
                <option value="A1">B1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">A2</option>
                <option value="C1">C1</option>
                <option value="C1">C2</option>
                <option value="very advanced">very advanced</option>
                <option value="advanced">advanced</option>
                <option value="high intermediate">high intermediate</option>
                <option value="low intermediate">low intermediate</option>
                <option value="advanced beginner">advanced beginner</option>
                <option value="beginner">beginner</option>
                </select><br></br>
                <label>
                <input
                  type="checkbox"
                  checked={isOnlyFailedChecked}
                  onChange={handleOnlyFailedCheckboxChange}
                />
                Only Failed
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={isReadMode}
                  onChange={handleOReadmodeCheckboxChange}
                />
                Read
              </label>
              <p>{audioRef.current==null?"none":audioRef.current.src}</p>
              <IntelligentText settokens={(toks) => {setTokens(toks);}} tokens={tokens} keyhandler={mykeyhandler}></IntelligentText> 
                </div>
                <div class="form-group">                
                <label for="sizeid">Size</label><input id="sizeid" type="text" size={3} value={chosenNumber} maxLength={2} onChange={(event)=>{setChosenNumber(event.target.value);
}}></input>
                </div>
                <button onClick={startRound}>Start</button>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>              
          </div>
        )}
        {state === 'showquestion' && (
          <div>
            <h2>Question  {chosenLevel} {pickedQuestionId} {window.gamedatabase.length} </h2>            
            <div class="form-group">
            {isReadMode ? 
            <p style={{fontSize:22}}>{window.clearChinese}</p>
            :
            <p style={{fontSize:22}}>{question}</p>
            }
            </div>
            <div class="form-group">                        
            <input type="text" size={50}></input>
            </div>
            <button id={"showButtonId"} onClick={showAnswer}>Show</button>
          </div>
        )}
        {state === 'showanswer' && (
          <div>
          <h2>Show Answer  {chosenLevel} {pickedQuestionId} {window.gamedatabase.length}</h2>
          <div class="form-group">            
          <p style={{fontSize:22}}>{question}</p>
          </div>
          <div class="form-group">                        
          <input type="text" size={50} ref={correctedEnglish}></input>
          <p>{audioRef.current==null?"none":audioRef.current.src}</p>
          <IntelligentText tokens={tokens} keyhandler={mykeyhandler} ></IntelligentText>
          <button onClick={freeai}>FreeAi</button><br></br>
          <select id="explainFormat">
            <option>Explain this sentence using English</option>
            <option>Is this proper Cantonese</option>
            <option>Explain the word order of this sentence</option>
            <option>Rewrite this to common spoken Cantonese</option>
            <option>Rewrite this using a different word order</option>
            <option>Make 10 sentences following the same pattern as this</option>
            <option>Rewrite this to Standard Chinese</option>
            <option>Translate this to English</option>
            </select>
            <select id="bot" onChange={()=>{window.changeBot = true;}}>Create 3 sentences in C1 level Cantonese containing this chunk:
            <option>Claude-3-Opus</option>
            <option>GPT-4</option>
            <option>Claude-3-Haiku</option>
            <option>Claude-3-Sonnet</option>
              </select><button onClick={explain}>Explain</button> <br></br>
              <select id="createFormat">
            <option> [SELECTED]</option> 
            <option>Create 3 sentences in B2 level Cantonese using the same patterns as in this</option>
            <option>Create 3 sentences in B2 level Cantonese using keywords from this</option>
            <option>Create 3 sentences in B2 level Cantonese following the using expressions from this</option>
            <option>Split this text up into sentences: </option>
            </select><button onClick={createSentences}>Create</button>
          </div>
          <button id = {"successButtonId"} onClick={success}>Success</button><br>
          </br>
          <input type="text" id="whyfail"></input><br></br>
          <button id = {"failureButtonId"} onClick={failure}>Failure</button>
          <button onClick={kill}>Kill</button><br/>
          <br></br>
          <br></br>
          <br></br>
        </div>
      )}

        {state === 'addstuff' && (
          <div>
            <h2>State {chosenLevel}</h2><br></br>
            <span>Chi/eng</span><br></br>
            <textarea ref={addStuffArea} cols={30} rows={20}> </textarea><br></br>
            <button onClick={addTheStuff}> do it</button>
            <button onClick={addMP3}>mp3</button>

          </div>
        )}

        {state === 'statistics' && (
          <div>
            <h2>Statistics 3 Content {chosenLevel}</h2>
            <p>Total time: {totalTimeString}</p>
            <p>{audioRef.current==null?"none":audioRef.current.src}</p>
          
            <IntelligentText tokens={tokens} keyhandler={mykeyhandler} ></IntelligentText>
 
          </div>
        )}        

        {state === 'pickmp3' && (
          <div>
            <h2>mp3 files</h2>
           { window.mp3files.map( (value,index,array) =>
                    {
                            return (<span><a onClick={pickAMP3}>{value}</a><a onClick={()=> { removeAudio(value)}}>kill</a><br></br></span>)
                      }) 
            }
          </div>
        )}
      </div>
      <br></br>
      <div
            style={{
              position: 'fixed',
              top: '0',
              width: '100%',
              backgroundColor: '#FFFFFF',
              color: '#000',
              padding: '0rem',
              textAlign: 'left',
            }}
      >
      <audio controls onTimeUpdate={handleTimeUpdate} onEnded={onAudioEnded} onPlay={handleStartPlay} ref={audioRef} muted={true}>
      <source src={"https://chinese.eriktamm.com/api/audioexample?dd=" + Date.now() } type="audio/mp3"/>
      </audio>
      ak<input type="checkbox"  id="autoKillCheckbox"></input>
      l<input type="checkbox"  id="loopCheckbox"></input>
      n<input type="checkbox" id="nextCheckbox" checked></input>
      <br></br>
      <button onClick={() => magicLookup()}>*</button>
      <button onClick={() => translatePage()}>Tran</button>   
      <button onClick={lookupSentence}>se?</button>
      <button onClick={lookupMark}>se!</button>
      <button onClick={() => loadSubtitle()}>ls</button>        
        <button onClick={() => handleSpeedChange(0.5)}>0.5x</button>
        <button onClick={() => handleSpeedChange(1)}>1x</button>
        <button onClick={() => refreshAudio()}>Ref</button>
        <button onClick={() => refreshAudio()}>Ta</button>
        
        <br></br>
        <button onClick={() => goBack(5)}>{"<<<"}</button>
        <button onClick={() => {
            let file = audioRef.current.src;
            let fileparts = file.split('/');
            file = fileparts[fileparts.length-1];
            removeAudio(file);
        }
        }>KILL</button><br></br>
              <button onClick={() => {
        const status = sequencePlayer.current.handleSequenceClick();
        setSequenceStatus(status);
      }}>Sequence {sequenceStatus && `(${sequenceStatus})`}</button>
      <button onClick={lookupAll}>lookupall</button>
      <button onClick={moveToNextSub}>moveToNextSub</button>
    


      
              <div>          
      </div>
      </div>
    </div>
    <Navigation></Navigation>

    </container>
  );
};

export default OutputTraining;

