import { Box, Link, ui } from "@adamjanicki/ui";
import useDocumentTitle from "src/hooks/useDocumentTitle";

export default function Home() {
  useDocumentTitle("Monsters");

  return (
    <Box
      vfx={{ axis: "y", align: "center", justify: "center", padding: "l" }}
      style={{ minHeight: "60vh" }}
    >
      <Box vfx={{ axis: "x", align: "center", gap: "m" }}>
        <ui.img
          src="/monsters/images/ray.webp"
          alt=""
          style={{ width: "min(300px, 25vw)" }}
        />
        <ui.h1 className="home-title-text">Monsters</ui.h1>
      </Box>
      <ui.p
        vfx={{
          textAlign: "center",
          paddingX: "m",
          fontWeight: 5,
          fontSize: "m",
        }}
      >
        A simple Pokémon toolkit for discovering new battle combos, movesets,
        and more!
        <br />
        <Link to="/dex">View the Dex</Link>
      </ui.p>
    </Box>
  );
}
