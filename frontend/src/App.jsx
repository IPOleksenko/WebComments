import { Routes, Route } from 'react-router-dom';
import Home from "./page/Home.jsx";
import PageNotFound from "./page/PageNotFound.jsx";


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;