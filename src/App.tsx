import { BrowserRouter, Route, Routes } from "react-router";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import Footer from "src/components/Footer";
import Nav from "src/components/Nav";
import Home from "src/pages/Home";
import NotFound from "src/pages/NotFound";
import ViewPokemon from "src/pages/ViewPokemon";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://graphqlpokemon.favware.tech/v8",
  }),
  cache: new InMemoryCache(),
  // will default to cache-first policy
});

const App = () => {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter basename="/monsters">
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dex/:slug" element={<ViewPokemon />} />
          {/* Make sure this is the last route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </ApolloProvider>
  );
};

export default App;
