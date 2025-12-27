import { useEffect } from "react";
import { useLocation } from "react-router";

// don't try to make this a hook, it has to be rendered within the router :/
const ScrollTop = () => {
  const { pathname, search } = useLocation();
  useEffect(
    () =>
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant" as ScrollBehavior,
      }),
    [pathname, search]
  );
  return null;
};

export default ScrollTop;
