import React, { startTransition, useState ,useRef} from 'react';
import Navigation from './Navigation';
import IntelligentText from './IntelligentText';

import {removeAudio,addListenedTo,addMP3ToServer,getArticleAudioExample,createexamples,getAudioExample,getTotalOutputTime,getTotalAudioTime, callPoeWithCallback,addAudioTimeToBackend,callPoe,getExampleResult, getexamples,writeExampleResult, addOutputExercise} from "./backendapi/backendcall"

const OutputTraining = () => {


    const [state, setState] = useState('state1');
    const [question,setQuestion] = useState('This is the sentence');
    const [chinese,setChinese] = useState('This is the chinese');
    const [tokens,setTokens] = useState([]);
    const [pickedQuestionId,setPickedQuestionId] = useState(-1);
    const [chosenLevel,setChosenLevel] = useState('');
    const [chosenNumber,setChosenNumber] = useState(10);
    const [totalTimeString,setTotalTimeString] = useState('');
    const intelligentTextRef = useRef(null);
    const correctedEnglish = useRef(null);
    const addStuffArea = useRef(null);
    const readmode = useState(false);
    

    const audioRef = useRef(null);

    const [playbackRate, setPlaybackRate] = useState(1);
    const handleSpeedChange = (speed) => {
      setPlaybackRate(speed);
      audioRef.current.playbackRate = speed;
    };
    
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

    const oneLoopSoundEnglish =() => {
      const message = new SpeechSynthesisUtterance();
      let txt = window.gamedatabase[window.soundId].english;
      // set the text to be spoken
      message.text = txt;
      message.lang = 'en-us';
      // create an instance of the speech synthesis object
      const speechSynthesis = window.speechSynthesis;
      // start speaking
      message.onend = (ev)=> {
        // pause for 5 seconds
        setTimeout(()=> {          
          window.soundId = window.soundId + 1;
          if ( window.soundId >= window.gamedatabase.length)
            window.soundId = 0;
          oneLoopSound();
        },4000);
      };
      speechSynthesis.speak(message);

    }

    const oneLoopSound=() => {
      const message = new SpeechSynthesisUtterance();
      let txt = '';
      let mytokens = window.gamedatabase[window.soundId].tokens;
      // set the text to be spoken
      for (var i=0;i< mytokens.length;i++) {
        txt = txt + mytokens[i];
      }
      message.text = txt;
      message.lang = 'zh-HK';
      // create an instance of the speech synthesis object
      const speechSynthesis = window.speechSynthesis;
      // start speaking
      message.onend = (ev)=> {
        // pause for 5 seconds
        setTimeout(()=> {                    
          oneLoopSoundEnglish();
        },4000);
      };
      speechSynthesis.speak(message);
    }


    const create = () => {
      //let mytokens = window.gamedatabase[pickedQuestionId].tokens;
      let mytokens = tokens;
      // set the text to be spoken
      let txt = '';
      
      for (var i=0;i< mytokens.length;i++) {
        txt = txt + mytokens[i];
      }
      let tmpquestion = '';

      if ( document.getElementById('createFormat').value.indexOf('[SELECTED]') == -1 ) {

        let selection = window.getSelection().toString();
        if (selection.length > 0) {
          txt = selection;        
        }
  
        tmpquestion = document.getElementById('createFormat').value + ' : ' + txt + ". Return these together with english translation in json format like this: [{\"english\":ENGLISH_SENTENCE,\"chinese\":CANTONESE_TRANSLATION}].Only respond with the json structure."
      }
      else {
        var selectedText = window.getSelection().toString();
        if (selectedText.length == 0) {
          selectedText = correctedEnglish.current.value;
        }
        tmpquestion = document.getElementById('createFormat').value.replace('[SELECTED]',selectedText) +". Return these together with english translation in json format like this: [{\"english\":ENGLISH_SENTENCE,\"chinese\":CANTONESE_TRANSLATION}].Only respond with the json structure."
        console.log(tmpquestion);
        }
        createexamples(tmpquestion,'A1', result => {
        let baba = result;
        console.log(baba);
        let gdb = window.gamedatabase;   
        for(var i =0 ; i < baba.length;i++) {
            gdb.push( {tokens:baba[i]['chinese'],english:baba[i]['english'] }   )
        }
        window.gamedatabase = gdb;
        changeState('showquestion');
    }
    );
    }

    const startSpeakingRound = () => {
      window.soundId = 0;
      oneLoopSound();
    }

    const startRound = ()=> {
        console.log('startRound');
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
      let selection = window.getSelection().toString();
      if (selection.length > 0) {
        txt = selection;        
      }

      let bot = document.getElementById('bot').value;      
      callPoeWithCallback(-1,document.getElementById('explainFormat').value + ' : ' + txt,bot,window.changeBot,result=>{
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


    function formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');
      
      return `${formattedHours}:${formattedMinutes}`;
    }

    const showStatistics = ()=> {
            getTotalOutputTime( total => {
            getTotalAudioTime( totalaudiotime => {
              setTotalTimeString( formatTime(total[0]/1000) +' ' + formatTime(total[1]/1000)  + ' Audio:'+ formatTime(totalaudiotime[0]/1000) +' ' + formatTime(totalaudiotime[1]/1000));
              setState('statistics');
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



  const addAudioTime = time => {    
      addAudioTimeToBackend(time,(totalTime)=> {
        window.totalAudioTime = totalTime;
      });
  }


  const addListenedToFromAudio =() => {
    /*
    if (window.currentSentences === undefined)
      return;
    if (window.currentSentences == null)
      return;
    console.log(window.currentSentences);
    let sentences = window.currentSentences;
    for (var i=0;i< sentences.length;i++) {
      try {
      let element = sentences[i];
      let resultvalue = document.getElementById('result'+i).value;
      let sent = '';
        element.forEach( c => {
          sent = sent + c;
        });
          console.log(' hi there' + document.getElementById('result'+i).value);
        addListenedTo(sent,JSON.stringify(element),resultvalue, result => {console.log(result);});
      } catch (e) {
        return;
      }
    };
    */

  }

  const refreshAudio =  (event) => {
    addListenedToFromAudio();
    getAudioExample(result=> {    
      console.log(result['filepath']);
      window.currentSentences = result['tokens'];
      let tmptok = [];
      for (var t = 0; t < result['tokens'].length;t++) {
        let senttok = result['tokens'][t];
        console.log(senttok);
        for (var i = 0;i<senttok.length;i++) {
          tmptok.push(senttok[i]);
        }
        tmptok.push('~');
        let str = '';
        str = str + '<select id=result'+t+'>';
        for(var i=0;i<10;i++) {
          str = str + '<option value="'+i+'">'+i+'</option>';
        }
        str = str + '</select>'
        tmptok.push(str);
        //tmptok.push('<input type="checkbox" size=1 value=0 id=result'+t+' onclick="return true;"></input>');        
        tmptok.push('~')
        tmptok.push('\n');
      }
      setTokens(result['tokens']);
      audioRef.current.src = 'mp3/' +result['filepath'];
    })
  }

  const refreshArticleAudio =  (event) => {
    getArticleAudioExample(result=> {    
      console.log(result['filepath']);
      setTokens(result['tokens']);
      audioRef.current.src = 'mp3/' +result['filepath'];
    })
  }


  const setMark = (event) => {
    window.playMark = window.currentPlayTime;
  }

  const goMark = (event) => {
    audioRef.current.currentTime = window.playMark;
  }

  const handleTimeUpdate = (event) => {
    let now = Date.now();
    window.currentPlayTime  = event.target.currentTime;
    let timePassed = now - window.lastTime;
    if (timePassed < 50000) {
        window.combinedTime += timePassed;
        if (window.combinedTime > 10000) {
          console.log('adding time');
          addOutputExercise("tralalallala","tralalala","mp3",1,0,window.combinedTime,Date.now(),
          result => {});
          window.combinedTime = 0;
        }
     }
     window.lastTime = Date.now();
  };

  const startManualTime = event => {
    window.manualTime = Date.now();
  }

  const stopManualTime = event => {
    if (window.manualTime === undefined)
      return;
    let timePassed = Date.now() - window.manualTime
    addOutputExercise("tralalallala","manualtime","mp3",1,0,timePassed,Date.now(),result=>{})
    window.manualTime = 0;
  }

  const handleStartPlay = (event) => {
    console.log('handleStartPlay');
    window.combinedTime = 0;
    window.lastTime = Date.now();
 };

 const goBack = (amount) => {
  audioRef.current.currentTime = audioRef.current.currentTime - (amount);
 };



  return (
    
    <container>
    <Navigation></Navigation>

    <div>
      <h1>State Component</h1>
      <div>
        <button onClick={() => changeState('inputlevel')}>inputlevel</button>
        <button onClick={() => changeState('showquestion')}>showquestion</button>
        <button onClick={() => changeState('showanswer')}>howanswer</button>
        <button onClick={() => changeState('addstuff')}>add stuff</button>
        <button onClick={() => showStatistics()}>statistics</button>        
      </div>
      <div>
        {state === 'inputlevel' && (
          <div>
            <h2>Start Test</h2>
            <div class="form-group">
            <label for="level">Level</label><select id = "level">
                <option value="A1">A1</option>
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
              <IntelligentText tokens={tokens}></IntelligentText> 
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
          <IntelligentText tokens={tokens}></IntelligentText>
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
            <select id="bot" onChange={()=>{window.changeBot = true;}}>
            <option>Claude-3-Opus</option>
            <option>GPT-4</option>
            <option>Claude-3-Haiku</option>
            <option>Claude-3-Sonnet</option>
              </select><button onClick={explain}>Explain</button> <br></br>
              <select id="createFormat">
            <option>Create 3 sentences in A1 level Cantonese containing this chunk: [SELECTED]</option> 
            <option>Create 3 sentences in A1 level Cantonese using the same patterns as in this</option>
            <option>Create 3 sentences in A1 level Cantonese using keywords from this</option>
            <option>Create 3 sentences in A1 level Cantonese following the using expressions from this</option>
            <option>Split this text up into sentences: </option>
            </select><button onClick={create}>Create</button>
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
            <IntelligentText tokens={tokens}></IntelligentText>
 
          </div>
        )}        
      </div>
      <br></br>
      <div
            style={{
              position: 'fixed',
              top: '0',
              width: '100%',
              backgroundColor: '#333',
              color: '#fff',
              padding: '0rem',
              textAlign: 'left',
            }}
      >
      <audio controls onTimeUpdate={handleTimeUpdate} onPlay={handleStartPlay} ref={audioRef} loop>
      <source src={"https://chinese.eriktamm.com/api/audioexample?dd=" + Date.now() } type="audio/mp3"/>
      </audio>
      <div>
        <button onClick={() => handleSpeedChange(0.5)}>0.5x</button>
        <button onClick={() => handleSpeedChange(0.75)}>0.75x</button>
        <button onClick={() => handleSpeedChange(1)}>1x</button>
        <button onClick={() => refreshAudio()}>Ref</button>
        <button onClick={() => refreshArticleAudio()}>RefA</button>
        <button onClick={() => setMark()}>M</button>
        <button onClick={() => goMark()}>G</button>
        <button onClick={() => goBack(2)}>{"<<"}</button>
        <button onClick={() => goBack(5)}>{"<<<"}</button>
        <button onClick={() => startManualTime()}>M sta</button>
        <button onClick={() => stopManualTime()}>M sto</button>
        <button onClick={() => {
            let file = audioRef.current.src;
            let fileparts = file.split('/');
            file = fileparts[fileparts.length-1];
            alert(file);
            removeAudio(file);
        }



        }>KILL</button>
               
      </div>
      </div>      
      <p>Current Playback Speed: {playbackRate}x</p>
    </div>
    </container>
  );
};

export default OutputTraining;

