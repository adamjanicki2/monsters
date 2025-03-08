import { useEffect, useState } from "react";
import { TripleFlip as Hamburger } from "@adamjanicki/ui";
import "src/components/nav.css";
import Link, { UnstyledLink } from "src/components/Link";
import { useLocation } from "react-router";

type NavlinkProps = {
  to: string;
  children: React.ReactNode;
};

const Nav = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  const Navlink = (props: NavlinkProps) => (
    <li className="navlink-li">
      <Link className="navlink" onClick={closeMenu} {...props} />
    </li>
  );

  return (
    <nav className="flex items-center justify-between w-100 pv2 ph4">
      <div className="flex items-center justify-between bar-container">
        <UnstyledLink className="flex" to="/">
          <img src="/monsters/logo.svg" width="40px" height="40px" />
        </UnstyledLink>
        <div className="mobile">
          <Hamburger open={open} onClick={() => setOpen(!open)} />
        </div>
      </div>
      <ul
        className="flex items-center desktop link-container ma0"
        style={{ display: open ? "flex" : undefined }}
      >
        <Navlink to="/">Home</Navlink>
        <Navlink to="/about/">About</Navlink>
      </ul>
    </nav>
  );
};

export default Nav;
