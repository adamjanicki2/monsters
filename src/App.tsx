import { Route, Router, Routes } from "@adamjanicki/ui";
import Footer from "src/components/Footer";
import Nav from "src/components/Nav";
import Dex from "src/pages/Dex";
import Home from "src/pages/Home";
import Move from "src/pages/Move";
import NotFound from "src/pages/NotFound";
import Pokemon from "src/pages/Pokemon";

const App = () => {
  return (
    <Router basename="/monsters">
      <Nav />
      <Routes fallback={<NotFound />}>
        <Route path="/" element={<Home />} />
        <Route path="/dex/:slug" element={<Pokemon />} />
        <Route path="/dex" element={<Dex />} />
        <Route path="/move/:slug" element={<Move />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
