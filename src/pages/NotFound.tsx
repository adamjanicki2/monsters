import PageWrapper from "src/components/PageWrapper";
import Link from "src/components/Link";

const NotFound = () => (
  <PageWrapper title="404">
    <p className="tc f4 fw4">
      Oops! The requested page does not exist.
      <br />
      Try going <Link to="/">home</Link>.
    </p>
  </PageWrapper>
);

export default NotFound;
