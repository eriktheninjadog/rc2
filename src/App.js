import logo from './logo.svg';
import './App.css';
import { BrowserRouter,Route,Routes } from 'react-router-dom';
import ImportTextPage from './components/ImportTextPage';


import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil';


function App() {
  return (
    <RecoilRoot>
    <BrowserRouter>
    <Routes>
        <Route path="" element={<ImportTextPage />} />
        <Route path="/import" element={<ImportTextPage />} />
    </Routes>
  </BrowserRouter>
  </RecoilRoot>
  );
}

export default App;
