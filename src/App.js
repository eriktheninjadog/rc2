import logo from './logo.svg';
import './App.css';
import { BrowserRouter,Route,Routes } from 'react-router-dom';
import ImportTextPage from './components/ImportTextPage';
import TextList from './components/TextList';
import React from 'react';
import { useState } from 'react';
import RCDocumentStack from './datacomponents/RCDocumentStack';

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

import {time_loop} from './components/timedfunctions'
import { registerEventListener } from './components/eventsystem/EventMarket';
import { EventType } from './components/eventsystem/Event';


export const UserContext = React.createContext(null);

setInterval(function () {time_loop();}, 1000);




const App = () => {

  const [documentStack, setDocumentStack] = useState(new RCDocumentStack());



  registerEventListener("gotoreaderonnewcws",
    ev => {
      return ev.type == EventType.CWSArrived;
    },
    ev => {
      window.location.href = 'reader';
    }
  );

  const messageEventSource = new EventSource('https://chinese.eriktamm.com/api/commandstream');
  window.mesource = messageEventSource; 
  messageEventSource.addEventListener('message', (event) => {
    console.log('   ' + event.data);
    if (event.data == 'REPEATEVENT') {
      if (window.repeatEvent != undefined && window.repeatEvent != null) {
        window.repeatEvent();
      } 
    }

    if (event.data == 'ENGLISHEVENT') {
      if (window.englishEvent != undefined && window.englishEvent != null) {
        window.englishEvent();
      } 
    }


    if (event.data == 'MARKEVENT') {
      if (window.markEvent != undefined && window.markEvent != null) {
        window.markEvent();
      } 
    }


    if (event.data == 'GOEVENT') {
      if (window.goEvent != undefined && window.goEvent != null) {
        window.goEvent();
      } 
    }
  });
 
  messageEventSource.addEventListener('open', (event) => {
    console.log('eventsource is opened   ');
  });
 
  messageEventSource.addEventListener('error', (event) => {
    console.log('eventsource is error   ');
  });


  const localmessageEventSource = new EventSource('http://localhost:9123');
  window.localmesource = localmessageEventSource; 
  localmessageEventSource.addEventListener('message', (event) => {
    console.log('   ' + event.data);
    if (event.data == 'REPEATEVENT') {
      if (window.repeatEvent != undefined && window.repeatEvent != null) {
        window.repeatEvent();
      } 
    }

    if (event.data == 'ENGLISHEVENT') {
      if (window.englishEvent != undefined && window.englishEvent != null) {
        window.englishEvent();
      } 
    }

  });
 
  localmessageEventSource.addEventListener('open', (event) => {
    console.log('eventsource is opened   ');
  });
 
  localmessageEventSource.addEventListener('error', (event) => {
    console.log('eventsource is error   ');
  });
 

 


  return (
    <RecoilRoot>
    <BrowserRouter>
    <UserContext.Provider value={{ documentStack: documentStack, setDocumentStack: setDocumentStack }}>
    <Routes>
        <Route path="" element={<ImportTextPage />} />
        <Route path="/import" element={<ImportTextPage />} />
        <Route path="/texts" element={<TextList />} />
        <Route path="/reader" element={<StackedDocumentReader />} />
        <Route path="/flash" element={<FlashCard />} />
        <Route path="/editdictionary" element={<EditDictionary />} />
        <Route path="/output" element={<OutputTraining />} />

    </Routes>
    </UserContext.Provider>
  </BrowserRouter>
  </RecoilRoot>
  );
}

export default App;
