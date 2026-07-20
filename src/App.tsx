import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
// import AutoPage from './pages/AutoPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/auto" element={<AutoPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
