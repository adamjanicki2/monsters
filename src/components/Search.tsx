import { Box, Icon, IconButton, IconInput, Layer, ui } from "@adamjanicki/ui";
import { getDeviceType } from "@adamjanicki/ui/functions";
import { FullOptions, Searcher } from "fast-fuzzy";
import { useEffect, useRef, useState } from "react";
import { UnstyledLink } from "src/components/Link";
import { makeIconSprite } from "src/utils/helpers";
import { pokemon, PokemonKey, pokemonKeys } from "src/utils/pokemon";
import "src/components/search.css";

type SearchResultType = "pokemon";
type PokemonResult = {
  key: string;
  name: string;
};
type SearchResult = {
  type: SearchResultType;
  data: PokemonResult;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

type MatchResult = {
  results: readonly SearchResult[];
  matches: number;
};

const searcher = new Searcher<PokemonKey, FullOptions<PokemonKey>>(
  pokemonKeys as PokemonKey[],
  {
    threshold: 0.5,
    ignoreCase: true,
  }
);

function search(query: string, limit: number): MatchResult {
  const rawResults = searcher.search(query);
  const results: SearchResult[] = rawResults.slice(0, limit).map((key) => ({
    type: "pokemon",
    data: { key, name: pokemon[key] },
  }));
  return {
    results,
    matches: rawResults.length,
  };
}

const vfxCenterMessage = {
  axis: "y",
  align: "center",
  gap: "s",
  fontWeight: 6,
  padding: "l",
} as const;

function Empty({ query }: { query: string }) {
  return (
    <Box vfx={vfxCenterMessage}>
      <Icon icon="search" size="l" />
      <ui.span>No results found for ‘{query}’</ui.span>
    </Box>
  );
}

const LIMIT = 20;

export default function Search({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();
  const { results, matches } = search(normalizedQuery, LIMIT);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    if (getDeviceType() === "desktop") {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  const showEmpty = results.length === 0 && normalizedQuery.length > 0;

  return (
    <Layer
      onClose={onClose}
      vfx={{
        axis: "y",
        align: "center",
        justify: "center",
        padding: "l",
      }}
    >
      <Box
        vfx={{
          axis: "y",
          backgroundColor: "default",
          border: true,
          radius: "rounded",
          shadow: "floating",
          overflow: "hidden",
        }}
        style={{ height: "80%" }}
        className="page-width"
        onTouchStart={() => inputRef.current?.blur()}
      >
        <Box vfx={{ axis: "y", gap: "s", padding: "m", borderBottom: true }}>
          <Box vfx={{ axis: "x", align: "center", justify: "between" }}>
            <ui.strong vfx={{ fontSize: "m" }}>Search</ui.strong>
            <IconButton onClick={onClose} icon="x" />
          </Box>

          <IconInput
            vfx={{ width: "full" }}
            inputProps={{
              value: query,
              onChange: (e) => setQuery(e.target.value),
              placeholder: "Search Pokémon…",
              ref: inputRef,
              autoFocus: getDeviceType() === "desktop",
              style: { padding: "14px 12px" },
            }}
            startIcon={
              <Icon
                vfx={{ color: "muted", marginLeft: "m" }}
                icon="search"
                size="m"
              />
            }
          />
        </Box>

        <Box vfx={{ height: "full", overflowY: "scroll" }}>
          {normalizedQuery.length === 0 ? (
            <Box vfx={vfxCenterMessage}>
              <Icon icon="search" size="l" />
              <ui.span>Search for a Pokémon name.</ui.span>
            </Box>
          ) : (
            <Box vfx={{ axis: "y", padding: "s" }}>
              {showEmpty && <Empty query={normalizedQuery} />}
              {results.map((result) => (
                <PokemonSearchResult
                  key={result.data.key}
                  result={result}
                  onClick={onClose}
                />
              ))}
            </Box>
          )}
        </Box>
        <Box
          vfx={{
            axis: "x",
            align: "center",
            justify: "between",
            padding: "m",
            borderTop: true,
          }}
        >
          <ui.span vfx={{ fontSize: "s", color: "muted" }}>
            {matches > 0
              ? `Showing ${results.length} of ${matches} result${
                  matches === 1 ? "" : "s"
                }`
              : "Hint: try typing!"}
          </ui.span>
        </Box>
      </Box>
    </Layer>
  );
}

type ResultRowProps = {
  result: SearchResult;
  onClick?: () => void;
};

function PokemonSearchResult({ result, onClick }: ResultRowProps) {
  return (
    <UnstyledLink
      to={`/dex/${result.data.key}`}
      onClick={onClick}
      vfx={{
        axis: "x",
        align: "center",
        justify: "between",
        gap: "m",
        width: "full",
        padding: "m",
        radius: "rounded",
        color: "inherit",
      }}
      className="dex-search-result"
    >
      <Box vfx={{ axis: "x", align: "center", gap: "s" }}>
        <ui.img
          src={makeIconSprite(result.data.key)}
          alt={result.data.name}
          width={60}
          height={60}
        />
        <ui.strong vfx={{ fontSize: "m" }}>{result.data.name}</ui.strong>
      </Box>
      <Icon icon="chevron-right" vfx={{ color: "muted" }} />
    </UnstyledLink>
  );
}
