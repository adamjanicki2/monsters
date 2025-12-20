import { BrowserRouter, Route, Routes } from "react-router";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import Footer from "src/components/Footer";
import Nav from "src/components/Nav";
import Home from "src/pages/Home";
import NotFound from "src/pages/NotFound";
import Species from "src/pages/Species";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://graphqlpokemon.favware.tech/v8",
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
    },
  },
});

const App = () => {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter basename="/monsters">
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dex/:name" element={<Species />} />
          {/* Make sure this is the last route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </ApolloProvider>
  );
};

export default App;
