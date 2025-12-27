import { BrowserRouter, Route, Routes } from "react-router";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import Footer from "src/components/Footer";
import Nav from "src/components/Nav";
import Home from "src/pages/Home";
import NotFound from "src/pages/NotFound";
import Pokemon from "src/pages/Pokemon";
import Move from "src/pages/Move";
import Dex from "src/pages/Dex";
import ScrollTop from "src/components/ScrollTop";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://graphqlpokemon.favware.tech/v8",
  }),
  cache: new InMemoryCache(),
});

const App = () => {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter basename="/monsters">
        <ScrollTop />
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dex/:slug" element={<Pokemon />} />
          <Route path="/dex" element={<Dex />} />
          <Route path="/move/:slug" element={<Move />} />
          {/* Make sure this is the last route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </ApolloProvider>
  );
};

export default App;
