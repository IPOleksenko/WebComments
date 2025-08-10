import { Routes, Route } from 'react-router-dom';
import { useEffect } from "react";

import Home from "./page/Home.jsx";
import PageNotFound from "./page/PageNotFound.jsx";
import fetchCsrfToken from "./utils/fetchCsrfToken.jsx"

function App() {
  useEffect(() => {
    fetchCsrfToken();
  }, []);

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