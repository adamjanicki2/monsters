import React, { useMemo, useState } from "react";
import { Alert, Spinner, Box, ui, Button, Select, Icon } from "@adamjanicki/ui";
import { Tooltip } from "@adamjanicki/ui-extended";
import BigBadge from "src/components/BigBadge";
import Link from "src/components/Link";
import Page from "src/components/Page";
import TypeBadge from "src/components/TypeBadge";
import useListPokemon from "src/hooks/useListPokemon";
import { getEffectiveBadgeInfo } from "src/pages/ViewPokemon";
import { padDexNumber } from "src/utils/helpers";

const dexSortKeys = ["dex", "name", "effective", "base"] as const;
type DexSortKey = (typeof dexSortKeys)[number];
type SortDir = "desc" | "asc";

const sortLabels = {
  dex: "Dex #",
  name: "Name",
  effective: "Stat total (effective)",
  base: "Stat total (base)",
} as const;

export default function Dex() {
  const { pokemon, loading, error } = useListPokemon();

  const [sortKey, setSortKey] = useState<DexSortKey>("dex");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedPokemon = useMemo(() => {
    if (!pokemon) return null;

    const copy = pokemon;

    const dir = sortDir === "asc" ? 1 : -1;

    copy.toSorted((a, b) => {
      const aDex = a.dexNumber;
      const bDex = b.dexNumber;

      if (sortKey === "dex") return (aDex - bDex) * dir;

      if (sortKey === "name") {
        const res = String(a.name).localeCompare(String(b.name));
        return res !== 0 ? res * dir : (aDex - bDex) * dir;
      }

      if (sortKey === "effective") {
        const res = (a.effectiveBaseTotal - b.effectiveBaseTotal) * dir;
        return res !== 0 ? res : (aDex - bDex) * dir;
      }

      const res = (a.baseTotal - b.baseTotal) * dir;
      return res !== 0 ? res : (aDex - bDex) * dir;
    });

    return copy;
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
              <Icon icon={sortDir === "asc" ? "chevron-up" : "chevron-down"} />
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
                <ui.img src={sprite} width={60} height={60} />
                <ui.strong vfx={{ fontSize: "m" }} style={{ width: "12ch" }}>
                  {name}
                </ui.strong>
              </Box>
              <Box
                vfx={{ axis: "x", gap: "xs", align: "center" }}
                style={{ flex: 1 }}
              >
                {mon.type.map((type) => (
                  <TypeBadge type={type} key={type} />
                ))}
              </Box>
              <Box vfx={{ axis: "x", align: "center", gap: "s" }}>
                <Tooltip offset={4} tooltipContent={tooltipContent}>
                  <BigBadge type={badgeType} vfx={{ italics: true }}>
                    {String(effectiveBaseTotal)}
                  </BigBadge>
                </Tooltip>
                <ui.strong>{baseTotal}</ui.strong>
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
