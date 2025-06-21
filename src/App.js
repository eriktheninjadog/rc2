import logo from './logo.svg';
import './App.css';
import { BrowserRouter,Route,Routes } from 'react-router-dom';
import ImportTextPage from './components/ImportTextPage';
import TextList from './components/TextList';
import React from 'react';
import { useState } from 'react';
import RCDocumentStack from './datacomponents/RCDocumentStack';
import AudioAdventure from './components/AudioAdventure';

import VideoPlayer from './components/videoplayer';
import { useEffect } from 'react';
import { useContext } from 'react';

import Admin from './components/admin';
  
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil';

import OutputTraining from './components/OutputTraining';
import StackedDocumentReader from './components/StackedDocumentReader';
import FlashCard from './components/FlashCard';
import EditDictionary from './components/EditDictionary';
import Adventure from './components/Adventure';


import {time_loop} from './components/timedfunctions'
import { registerEventListener } from './components/eventsystem/EventMarket';
import { EventType } from './components/eventsystem/Event';
import CoachComponent from './components/CoachComponent';


export const UserContext = React.createContext(null);

setInterval(function () {time_loop();}, 1000);


const handleSelection = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    console.log('Selected text:', selectedText);
  }
}



const App = () => {

  const [documentStack, setDocumentStack] = useState(new RCDocumentStack());


  document.addEventListener('selectionchange', handleSelection);



  registerEventListener("gotoreaderonnewcws",
    ev => {
      return ev.type == EventType.CWSArrived;
    },
    ev => {
      window.location.href = 'reader';
    }
  );

 
  return (
    <RecoilRoot>
    <BrowserRouter>
    <UserContext.Provider value={{ documentStack: documentStack, setDocumentStack: setDocumentStack }}>
    <Routes>
        <Route path="" element={<ImportTextPage />} />
        <Route path="/import" element={<ImportTextPage />} />
        <Route path="/audioadventure" element={<AudioAdventure />} />
        <Route path="/adventure" element={<Adventure />} />
        <Route path="/coach" element={<CoachComponent />} />
        <Route path="/video" element={<VideoPlayer/>} />
        <Route path="/editdictionary" element={<EditDictionary />} />
        <Route path="/output" element={<OutputTraining />} />
        
    </Routes>
    </UserContext.Provider>
  </BrowserRouter>
  </RecoilRoot>
  );
}

export default App;
