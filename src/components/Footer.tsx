import Link from "src/components/Link";

const Footer = () => (
  <footer className="pv5 ph2 flex bt b--moon-gray bw1 items-center justify-center w-100">
    <p className="fw5 f5 tc">
      Est. 2025 Built from scratch by{" "}
      <Link target="_blank" rel="noreferrer" to="https://adamjanicki.xyz">
        Adam
      </Link>
    </p>
  </footer>
);

export default Footer;
