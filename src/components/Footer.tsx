import { Link } from "@adamjanicki/ui";

const Footer = () => (
  <footer className="pv5 ph2 flex bt b--moon-gray bw1 items-center justify-center w-100">
    <p className="fw5 f5 tc">
      Created from{" "}
      <Link
        target="_blank"
        rel="noreferrer"
        className="link"
        to="https://github.com/adamjanicki2/react-skeleton"
      >
        React Skeleton
      </Link>
      , built by Adam
    </p>
  </footer>
);

export default Footer;
