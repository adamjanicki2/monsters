import { Route, Router, Routes } from "@adamjanicki/ui";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import Footer from "src/components/Footer";
import Nav from "src/components/Nav";
import Dex from "src/pages/Dex";
import Home from "src/pages/Home";
import Move from "src/pages/Move";
import NotFound from "src/pages/NotFound";
import Pokemon from "src/pages/Pokemon";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://graphqlpokemon.favware.tech/v8",
  }),
  cache: new InMemoryCache(),
});

const App = () => {
  return (
    <ApolloProvider client={client}>
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
    </ApolloProvider>
  );
};

export default App;
