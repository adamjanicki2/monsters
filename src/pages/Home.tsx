import PageWrapper from "src/components/PageWrapper";

const Home = () => (
  <PageWrapper title="Home">
    <p className="tc f4 fw4">
      You should run <code>setup.py</code> to auto-rename a bunch of strings.{" "}
      <br />
      You can search for <code>skeleton</code> in your editor to find all places
      where you should make your own changes if you really want to do it
      manually
    </p>
  </PageWrapper>
);

export default Home;
