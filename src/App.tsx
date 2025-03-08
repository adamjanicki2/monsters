import { BrowserRouter, Route, Routes } from "react-router";
import Footer from "src/components/Footer";
import Nav from "src/components/Nav";
import Home from "src/pages/Home";
import NotFound from "src/pages/NotFound";
import Species from "src/pages/Species";
import { slugifyName } from "src/utils/helpers";
import { pokemon } from "src/utils/pokemon";

const App = () => {
  return (
    <BrowserRouter basename="/monsters">
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        {pokemon.map((name, i) => (
          <Route
            key={i}
            path={`/mon/${slugifyName(name)}`}
            element={<Species name={name} dexNo={i + 1} />}
          />
        ))}
        {/* Make sure this is the last route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
