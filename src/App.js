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
import * as serviceWorkerRegistration from './serviceWorkerRegistration';


export const UserContext = React.createContext(null);

setInterval(function () {time_loop();}, 1000);


const App = () => {

  const [documentStack, setDocumentStack] = useState(new RCDocumentStack());


  serviceWorkerRegistration.register();

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
