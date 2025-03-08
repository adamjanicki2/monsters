import { useDocumentTitle } from "src/hooks";

export default function Home() {
  useDocumentTitle("Monsters");

  return (
    <div
      style={{ minHeight: "60vh" }}
      className="flex items-center justify-center flex-wrap"
    >
      <div className="flex flex-column items-center pv4">
        <div className="flex items-center">
          <img
            src="/monsters/images/ray.webp"
            alt=""
            style={{ width: "min(300px, 30vw)" }}
          />
          <h1 className="home-title-text mb0 ml3">Monsters</h1>
        </div>
        <p className="home-description ph3 tc">
          A simple Pokémon toolkit for discovering new battle combos, movesets,
          and more!
        </p>
      </div>
    </div>
  );
}
