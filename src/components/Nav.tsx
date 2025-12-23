import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Box, TripleFade as Hamburger, ui, IconButton } from "@adamjanicki/ui";
import Link, { UnstyledLink } from "src/components/Link";
import Search from "src/components/Search";
import "src/components/nav.css";

type NavlinkProps = {
  to: string;
  children: React.ReactNode;
};

export default function Nav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeMenu = () => setOpen(false);
  const openSearch = () => setSearchOpen(true);
  const closeSearch = () => setSearchOpen(false);

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT") {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        openSearch();
      }

      if (e.key === "Escape") {
        closeSearch();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const Navlink = (props: NavlinkProps) => (
    <Link
      vfx={{ width: "full", fontWeight: 6, color: "default", fontSize: "m" }}
      style={{ whiteSpace: "nowrap" }}
      onClick={closeMenu}
      {...props}
    />
  );

  return (
    <>
      <ui.nav vfx={{ paddingY: "s", paddingX: "l" }}>
        <Box
          vfx={{ axis: "x", align: "center", justify: "between" }}
          className="bar-container"
        >
          <UnstyledLink to="/">
            <ui.img src="/monsters/logo.svg" width="40" height="40" alt="" />
          </UnstyledLink>

          <Box
            vfx={{ axis: "x", align: "center", gap: "s" }}
            className="mobile"
          >
            <IconButton
              icon="search"
              color="muted"
              onClick={openSearch}
              size="m"
            />
            <Hamburger open={open} onClick={() => setOpen(!open)} />
          </Box>
        </Box>

        {/* Nav links */}
        <Box
          className="desktop navlink-container"
          style={open ? { display: "flex" } : undefined}
        >
          <Navlink to="/">Home</Navlink>
          <Navlink to="/dex">Dex</Navlink>
          <IconButton
            icon="search"
            color="muted"
            className="desktop"
            onClick={openSearch}
            size="m"
          />
        </Box>
      </ui.nav>

      {/* Search layer */}
      <Search open={searchOpen} onClose={closeSearch} />
    </>
  );
}
