import {
  Alert,
  Box,
  Button,
  Icon,
  Link,
  Select,
  Spinner,
  Tooltip,
  ui,
} from "@adamjanicki/ui";
import { chevronDown, chevronUp } from "@adamjanicki/ui/icons";
import React, { useMemo, useState } from "react";
import BigBadge from "src/components/BigBadge";
import Page from "src/components/Page";
import TypeBadge from "src/components/TypeBadge";
import useListPokemon from "src/hooks/useListPokemon";
import { getEffectiveBadgeInfo } from "src/pages/Pokemon";
import { padDexNumber } from "src/utils/helpers";

const dexSortKeys = [
  "dexNumber",
  "name",
  "effectiveBaseTotal",
  "baseTotal",
] as const;
type DexSortKey = (typeof dexSortKeys)[number];
type SortDir = "desc" | "asc";

const sortLabels = {
  dexNumber: "Dex #",
  name: "Name",
  effectiveBaseTotal: "Stat total (effective)",
  baseTotal: "Stat total (base)",
} as const;

export default function Dex() {
  const { pokemon, loading, error } = useListPokemon();
  const [sortKey, setSortKey] = useState<DexSortKey>("dexNumber");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedPokemon = useMemo(() => {
    if (!pokemon) return null;
    pokemon.sort((a, b) => cmp(a[sortKey], b[sortKey], sortDir));

    return pokemon;
  }, [pokemon, sortKey, sortDir]);

  if (error || (!loading && !pokemon)) {
    return (
      <Wrapper>
        <Alert type="error">
          {error || "There was an error fetching from the API"}
        </Alert>
      </Wrapper>
    );
  }

  if (loading || !pokemon || !sortedPokemon) {
    return (
      <Wrapper>
        <Box vfx={{ width: "full" }}>
          <Spinner />
        </Box>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Box vfx={{ axis: "y", gap: "xs" }}>
        <ui.span vfx={{ fontSize: "s", color: "muted", fontWeight: 6 }}>
          Sort
        </ui.span>

        <Box vfx={{ axis: "x", align: "center", gap: "s", wrap: true }}>
          <Select
            aria-label="sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as DexSortKey)}
            options={[...dexSortKeys]}
            getOptionLabel={(sortKey) => sortLabels[sortKey as DexSortKey]}
          />

          <Button
            variant="secondary"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            vfx={{ width: "fit" }}
          >
            <Box vfx={{ axis: "x", align: "center", gap: "xs" }}>
              <Icon icon={sortDir === "asc" ? chevronUp : chevronDown} />
              {sortDir === "asc" ? "Ascending" : "Descending"}
            </Box>
          </Button>
        </Box>
      </Box>

      <Box
        vfx={{
          axis: "y",
          border: true,
          radius: "rounded",
          shadow: "subtle",
          backgroundColor: "default",
          padding: "xs",
        }}
      >
        {sortedPokemon.map((mon, rowIndex) => {
          const { name, sprite, baseTotal, effectiveBaseTotal, key } = mon;
          const [badgeType, tooltipContent] = getEffectiveBadgeInfo(mon);

          const dexNumber = mon.dexNumber;

          return (
            <Link
              to={`/dex/${key}`}
              key={key}
              vfx={{
                axis: "x",
                align: "center",
                justify: "between",
                wrap: true,
                width: "full",
                color: "inherit",
                padding: "m",
                borderTop: rowIndex > 0,
              }}
            >
              <Box vfx={{ axis: "x", align: "center", gap: "xs" }}>
                <ui.strong vfx={{ fontSize: "m" }}>
                  {padDexNumber(dexNumber)}
                </ui.strong>
                <ui.img src={sprite} width={48} height={48} />
                <ui.strong vfx={{ fontSize: "m" }} style={{ width: "12ch" }}>
                  {name}
                </ui.strong>
              </Box>
              <Box
                vfx={{
                  axis: "x",
                  align: "center",
                  gap: "s",
                  justify: "between",
                }}
                style={{ flex: 1 }}
              >
                <Box vfx={{ axis: "x", gap: "xs", align: "center" }}>
                  {mon.type.map((type) => (
                    <TypeBadge type={type} key={type} />
                  ))}
                </Box>
                <Box vfx={{ axis: "x", align: "center", gap: "xs" }}>
                  <Tooltip
                    offset={4}
                    anchor={
                      <BigBadge type={badgeType} vfx={{ italics: true }}>
                        {String(effectiveBaseTotal)}
                      </BigBadge>
                    }
                  >
                    {tooltipContent}
                  </Tooltip>
                  <ui.strong>{baseTotal}</ui.strong>
                </Box>
              </Box>
            </Link>
          );
        })}
      </Box>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <Page documentTitle="Dex">
      <Box vfx={{ axis: "y", gap: "l", paddingY: "l", width: "full" }}>
        <ui.h1
          className="page-title-text"
          vfx={{ fontWeight: 9, margin: "none" }}
        >
          Dex
        </ui.h1>
        {children}
      </Box>
    </Page>
  );
}

function cmp<T extends string | number>(a: T, b: T, dir: SortDir) {
  const result =
    typeof a === "string"
      ? a.localeCompare(b as string)
      : Number(a) - Number(b);

  return dir === "asc" ? result : -result;
}
