import { Row,Col,Button,Container } from "react-bootstrap";
import { Timer } from "./backendapi/timer";
import { addOutputExercise,backEndCall,getTotalAudioTime,getTotalOutputTime } from "./backendapi/backendcall";
import { useState,useRef } from "react";
import Navigation from "./Navigation";

import { UserContext } from "../App";

import {tokenizeChineseText} from "./backendapi/tokenizer"
import { tokenizeChinese } from "./backendapi/backendcall";

import React from "react";
import IntelligentText from "./IntelligentText";
import { SRTParser } from "./srtparser";

import { ActivityTimeManager } from "./ActivityManager";
import {  ActivityTimer, getActivityTimer } from "./ActivityTimer";
import { getActiveElement } from "@testing-library/user-event/dist/utils";

// Function to fetch webm files from the backend
// Function to fetch webm files from the backend
const fetchWebmFiles = () => {
  fetch('/api/get_webm_files')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.result) {
        // Join the filenames with newlines for better readability in textarea
        const filesText = data.result.join('\n');
        document.getElementById('files').value = filesText;
      } else if (data.error) {
        console.error('Error fetching files:', data.error);
        document.getElementById('files').value = 'Error: ' + data.error;
      }
    })
    .catch(error => {
      console.error('Error fetching webm files:', error);
      document.getElementById('files').value = 'Error fetching files: ' + error.message;
    });
};

// Function to get drift value as integer with default of 0
const getDrift = () => {
  const driftInput = document.getElementById('drift');
  if (!driftInput || driftInput.value === '') {
    return -1;
  }
  
  const value = parseInt(driftInput.value, 10);
  return isNaN(value) ? 0 : value;
};


const VideoPlayer = ({ src, type, poster, width, height, controls = true }) => {

    const [tokens,setTokens] = useState([]);
    const videoRef = useRef(null);
    const videoName = useRef(null);


    if (window.srtParser == undefined)
      window.srtParser=new SRTParser("https://chinese.eriktamm.com/watchit/deadringer2.srt");
    window.srtParser.fetchSRT();

    if (window.timer == undefined)
      window.timer = new Timer("https://chinese.eriktamm.com/api/addoutputexercise");
   
    function formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');
      
      return `${formattedHours}:${formattedMinutes}`;
    }


    const showStat=()=>{
      getTotalOutputTime( total => {
        getTotalAudioTime( totalaudiotime => {
          let vid = formatTime(total[0]/1000) +' ' + formatTime(total[1]/1000)  + ' Audio:'+ formatTime(totalaudiotime[0]/1000) +' ' + formatTime(totalaudiotime[1]/1000);
          document.getElementById("combinedTime").innerHTML = vid;
        });
      });

    }


    const handleTimeUpdate = (time) => {
     getActivityTimer().heartbeat();
     window.timer.start();
        let mytime = videoRef.current.currentTime;
        let secs = parseFloat(mytime);  
        let drift = getDrift();
        let subtitle = null;
        if (drift != -1) {
           subtitle = window.srtParser.getSRTIndex(drift-1); 
        } else {       
           subtitle = window.srtParser.getSRT(secs);
        }
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

    return (
      <div className="video-player">
        <textarea id="files"></textarea>
        <input type="text" id="drift"></input>
      Video<input ref={videoName}></input><br></br>
      <button onClick={() => {
        videoRef.current.src = 'https://chinese.eriktamm.com/watchit/'+videoName.current.value + '.webm'
        window.srtParser.reparse('https://chinese.eriktamm.com/watchit/'+videoName.current.value + '.srt');
        window.srtParser.fetchSRT();
      }}>Change</button><br></br>
      <button onClick={() => {
        fetchWebmFiles();
      }}>Get</button><br></br>

        <video
          width={width || "640"}
          height={height || "360"}
          controls={true}
          poster={poster}
          onTimeUpdate={handleTimeUpdate}
          onPlay={()=>{
            if (getActivityTimer().isRunning() == true) {
              getActivityTimer().pause();
            }
            getActivityTimer().start('listening');
            }}
          ref={videoRef}
          
        >
          <source src="https://chinese.eriktamm.com/watchit/deadringer2.webm" type={type || "video/webm"} />
          Your browser does not support the video tag.
        </video>

        <IntelligentText tokens={tokens}></IntelligentText>               
        <div id={"combinedTime"}></div>

        <button onClick={() => {
          window.timer.start();
      }}>start</button>

      <button onClick={() => {
          window.timer.pause();
      }}>stop</button>
   
      <button onClick={() => {
        backEndCall("ask_nova",{"text":"translate this to english:" + window.subtitle},(result) => {
          setTokens(result);
        })
      }}>translate</button>
   
      <button onClick={() => {
        backEndCall("ask_nova",{"text":"rephrase this to spoken colloqial cantonese:" + window.subtitle},(result) => {
          setTokens(result);
        })
      }}>cant</button>
      
      <button onClick={() => {
        backEndCall("make_c1_examples",{"pattern":"using vocabulary,grammars and set expression from this sentence: "+window.subtitle},(result) => {
          console.log(result);
        });
      }}>Remember</button>
      <br></br>
      <button onClick={() => {
        videoRef.current.currentTime = videoRef.current.currentTime - 1;
      }}>Back1</button>
      <br></br>

      <button onClick={() => {
        videoRef.current.currentTime = videoRef.current.currentTime - 5;
      }}>Back5</button>
      <br></br>
      <button onClick={() => {
        document.getElementById("drift").value = getDrift() - 1;
      }}>S-</button>
      
      <button onClick={() => {
        document.getElementById("drift").value = getDrift() + 1;
      }}>S+</button>
      <br></br>
      
      </div>
      
    );
  };
  



export default VideoPlayer;