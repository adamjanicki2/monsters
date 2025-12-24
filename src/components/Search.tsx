import React from "react";
import { Box, Icon, IconButton, IconInput, Layer, ui } from "@adamjanicki/ui";
import { assertDefined, getDeviceType } from "@adamjanicki/ui/functions";
import { FullOptions, Searcher } from "fast-fuzzy";
import { useEffect, useRef, useState } from "react";
import { UnstyledLink } from "src/components/Link";
import { makeIconSprite, partition } from "src/utils/helpers";
import pokemon, { type PokemonKey, pokemonKeys } from "src/data/pokemon";
import "src/components/search.css";
import type { Category, Type } from "src/utils/types";
import moves, { MoveKey, moveKeys } from "src/data/moves";
import TypeBadge from "src/components/TypeBadge";

type PokemonResult = {
  readonly type: "dex";
  readonly data: {
    readonly key: string;
    readonly name: string;
  };
};

type MoveResult = {
  readonly type: "move";
  readonly data: {
    readonly key: string;
    readonly name: string;
    readonly type: Type;
    readonly category: Category;
  };
};

type SearchResult = PokemonResult | MoveResult;

const headers = {
  dex: "Pokemon",
  move: "Move",
} as const;

type Props = {
  open: boolean;
  onClose: () => void;
};

type MatchResult = {
  results: Map<SearchResult["type"], SearchResult[]>;
  matches: number;
};

type SearchKey = PokemonKey | MoveKey;
const searchKeys = (pokemonKeys as Array<SearchKey>).concat(moveKeys);

const searcher = new Searcher<SearchKey, FullOptions<SearchKey>>(searchKeys, {
  threshold: 0.7,
  ignoreCase: true,
});

function search(query: string): MatchResult {
  const rawResults = searcher.search(query);
  const results: SearchResult[] = rawResults.slice(0, 20).map((key) => {
    if (key in pokemon) {
      const name = pokemon[key as PokemonKey];
      return {
        type: "dex",
        data: {
          key: key as PokemonKey,
          name,
        },
      } as SearchResult;
    }

    const move = moves[key as MoveKey];
    return {
      type: "move",
      data: {
        key: key as MoveKey,
        name: move.name,
        type: move.type,
        category: move.category,
      },
    } as SearchResult;
  });

  return {
    results: partition(results, (item) => item.type),
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

export default function Search({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();
  const { results, matches } = search(normalizedQuery);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    if (getDeviceType() === "desktop") {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  const showEmpty = matches === 0 && normalizedQuery.length > 0;

  const keys = results.keys().toArray().sort();

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
              {keys.map((key) => {
                const items = assertDefined(results.get(key));
                return (
                  <React.Fragment key={key}>
                    <ui.h3
                      vfx={{
                        margin: "s",
                        paddingBottom: "xs",
                        fontSize: "m",
                        fontWeight: 9,
                        borderBottom: true,
                      }}
                    >
                      {headers[key]}
                    </ui.h3>
                    {items.map((item) => (
                      <Result
                        result={item}
                        onClick={onClose}
                        key={item.data.key}
                      />
                    ))}
                  </React.Fragment>
                );
              })}
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
              ? `Showing ${results.size} of ${matches} result${
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

function Result({ result, onClick }: ResultRowProps) {
  const { type, data } = result;
  const to = `/${type}/${data.key}`;

  return (
    <UnstyledLink
      to={to}
      onClick={onClick}
      vfx={{
        axis: "x",
        align: "center",
        justify: "between",
        gap: "m",
        width: "full",
        padding: "s",
        radius: "rounded",
        color: "inherit",
      }}
      className="dex-search-result"
    >
      {renderInnerContent(result)}
      <Icon icon="chevron-right" vfx={{ color: "muted" }} />
    </UnstyledLink>
  );
}

const renderInnerContent = (result: SearchResult) => {
  switch (result.type) {
    case "dex":
      return renderPokemonResult(result);
    case "move":
      return renderMoveResult(result);
    default:
      throw new Error("unexpected default case");
  }
};

const renderPokemonResult = (result: PokemonResult) => (
  <Box vfx={{ axis: "x", align: "center", gap: "s" }}>
    <ui.strong vfx={{ fontSize: "m" }}>{result.data.name}</ui.strong>
    <ui.img
      src={makeIconSprite(result.data.key)}
      alt={result.data.name}
      width={48}
      height={48}
    />
  </Box>
);

const renderMoveResult = (result: MoveResult) => (
  <Box vfx={{ axis: "x", align: "center", gap: "s", paddingY: "s" }}>
    <ui.strong vfx={{ fontSize: "m" }}>{result.data.name}</ui.strong>
    <TypeBadge type={result.data.type} />
  </Box>
);
