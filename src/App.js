import logo from './logo.svg';
import './App.css';
import { BrowserRouter,Route,Routes } from 'react-router-dom';
import ImportTextPage from './components/ImportTextPage';
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
import StackedDocumentReader from './components/StackedDocumentReader';

export const UserContext = React.createContext(null);

const App = () => {

  const [documentStack, setDocumentStack] = useState(new RCDocumentStack());
  return (
    <RecoilRoot>
    <BrowserRouter>
    <UserContext.Provider value={{ documentStack: documentStack, setDocumentStack: setDocumentStack }}>
    <Routes>
        <Route path="" element={<ImportTextPage />} />
        <Route path="/import" element={<ImportTextPage />} />
        <Route path="/reader" element={<StackedDocumentReader />} />

    </Routes>
    </UserContext.Provider>
  </BrowserRouter>
  </RecoilRoot>
  );
}

export default App;
