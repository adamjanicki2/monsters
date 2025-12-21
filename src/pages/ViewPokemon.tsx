import React, { useMemo, useState } from "react";
import {
  Alert,
  Spinner,
  Box,
  ui,
  Badge,
  Button,
  assertDefined,
} from "@adamjanicki/ui";
import { Tooltip } from "@adamjanicki/ui-extended";
import { useParams } from "react-router";
import Page from "src/components/Page";
import useGetPokemon from "src/hooks/useGetPokemon";
import NotFound from "src/pages/NotFound";
import { getProperName, stats, types } from "src/utils/pokemon";
import type { Pokemon, Type } from "src/utils/types";
import { clamp, formatKg, formatMeters, padDexNumber } from "src/utils/helpers";
import TypeBadge from "src/components/TypeBadge";

export default function ViewPokemon() {
  const params = useParams<{ slug: string }>();
  const key = assertDefined(params.slug);
  const properName = getProperName(key);

  const { pokemon, loading, error } = useGetPokemon({ key, properName });

  if (!properName) {
    return <NotFound />;
  }

  if (error || (!loading && !pokemon)) {
    return (
      <Page documentTitle={`Error: ${properName}`}>
        <Alert type="error">
          {error || `No data could be found for '${properName}'`}
        </Alert>
      </Page>
    );
  }

  return (
    <Page documentTitle={properName}>
      <Box vfx={{ axis: "y", gap: "l", paddingY: "l", width: "full" }}>
        <Header pokemon={pokemon} name={properName} />
        {loading || !pokemon ? (
          <Spinner />
        ) : (
          <>
            <IntroInfo pokemon={pokemon} />
            <MainGrid pokemon={pokemon} />
          </>
        )}
      </Box>
    </Page>
  );
}

function Header({ pokemon, name }: { pokemon?: Pokemon; name: string }) {
  return (
    <Box vfx={{ axis: "x", align: "center", gap: "m", wrap: true }}>
      <ui.h1
        className="page-title-text"
        vfx={{ fontWeight: 9, margin: "none" }}
      >
        {name}
      </ui.h1>
      {pokemon && pokemon.rarity && (
        <Badge vfx={{ height: "fit" }} type="success">
          {pokemon.rarity.toUpperCase()}
        </Badge>
      )}
    </Box>
  );
}

function IntroInfo({ pokemon }: { pokemon: Pokemon }) {
  return (
    <Box
      vfx={{
        axis: "x",
        gap: "xl",
        wrap: true,
        padding: "m",
        border: true,
        radius: "rounded",
        backgroundColor: "default",
        shadow: "subtle",
      }}
    >
      <SpritePanel pokemon={pokemon} />
      <Box vfx={{ axis: "y", gap: "xs" }}>
        <Box vfx={{ axis: "y", gap: "xs" }}>
          <Subheader>{"#" + padDexNumber(pokemon.dexNumber)}</Subheader>
          <Box vfx={{ axis: "x", gap: "xs", align: "center" }}>
            {pokemon.type.map((type) => (
              <TypeBadge type={type} key={type} />
            ))}
          </Box>
          <ui.strong vfx={{ color: "muted" }}>{pokemon.desc}</ui.strong>
        </Box>

        <KeyValueGrid
          rows={[
            ["Height", formatMeters(pokemon.height)],
            ["Weight", formatKg(pokemon.weight)],
            pokemon.gender
              ? [
                  "Breeding",
                  `♂ ${pokemon.gender.male} / ♀ ${pokemon.gender.female}`,
                ]
              : null,
            [
              "Catch Rate",
              <ui.span>
                {pokemon.catchRate[0]}{" "}
                <ui.em vfx={{ fontWeight: 5, color: "muted" }}>
                  ({pokemon.catchRate[1]} at full HP)
                </ui.em>
              </ui.span>,
            ],
            ["Base Total", String(pokemon.baseTotal)],
            ["Effective Total", String(pokemon.effectiveBaseTotal)],
          ]}
        />
      </Box>

      <AbilitiesPanel pokemon={pokemon} />
    </Box>
  );
}

function SpritePanel({ pokemon }: { pokemon: Pokemon }) {
  const [showShiny, setShowShiny] = useState(false);

  return (
    <Box vfx={{ axis: "y", gap: "s", align: "center" }}>
      <ui.img
        src={showShiny ? pokemon.shinySprite : pokemon.sprite}
        alt={pokemon.name}
        vfx={{ borderBottom: true }}
      />
      <Button size="small" onClick={() => setShowShiny(!showShiny)}>
        {showShiny ? "Normal" : "Shiny"} sprite
      </Button>
    </Box>
  );
}

function MainGrid({ pokemon }: { pokemon: Pokemon }) {
  return (
    <Box
      vfx={{
        axis: "x",
        gap: "l",
        wrap: true,
        align: "start",
      }}
    >
      <Box vfx={{ axis: "y", gap: "l" }} style={{ flex: 1, minWidth: 400 }}>
        <StatsSection pokemon={pokemon} />
        <FlavorSection pokemon={pokemon} />
      </Box>

      <Box className="type-section">
        <TypeEffectivenessSection pokemon={pokemon} />
      </Box>
    </Box>
  );
}

function SectionCard({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      vfx={{
        axis: "y",
        gap: "s",
        padding: "m",
        border: true,
        radius: "rounded",
        backgroundColor: "default",
        shadow: "subtle",
      }}
    >
      <Box
        vfx={{
          axis: "x",
          justify: "between",
          align: "center",
          wrap: true,
          gap: "s",
        }}
      >
        <Subheader>{title.toUpperCase()}</Subheader>
        {right && (
          <Box vfx={{ axis: "x", gap: "s", align: "center" }}>{right}</Box>
        )}
      </Box>

      {children}
    </Box>
  );
}

function KeyValueGrid({
  rows,
}: {
  rows: Array<[string, React.ReactNode] | null>;
}) {
  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: "8px 12px",
        alignItems: "baseline",
      }}
    >
      {rows.map((row) => {
        if (!row) return null;
        const [k, v] = row;
        return (
          <React.Fragment key={k}>
            <ui.span vfx={{ color: "muted" }}>{k}</ui.span>
            <ui.strong>{v}</ui.strong>
          </React.Fragment>
        );
      })}
    </Box>
  );
}

function AbilitiesPanel({ pokemon }: { pokemon: Pokemon }) {
  const { first, second, hidden } = pokemon.abilities;

  return (
    <Box vfx={{ axis: "y", gap: "s" }}>
      <Subheader>Abilities</Subheader>
      <AbilityRow ability={first} label="Primary" />
      {second && <AbilityRow ability={second} label="Secondary" />}
      {hidden && <AbilityRow ability={hidden} label="Hidden" />}
    </Box>
  );
}

function AbilityRow({
  ability,
  label,
}: {
  ability: Pokemon["abilities"]["first"];
  label: string;
}) {
  return (
    <Box vfx={{ axis: "y", gap: "xxs" }}>
      <Box vfx={{ axis: "x", gap: "xs", align: "center" }}>
        <ui.strong>{ability.name}</ui.strong>
        <ui.span vfx={{ fontSize: "s", color: "muted" }}>({label})</ui.span>
      </Box>
      <ui.p vfx={{ color: "muted", margin: "none" }}>{ability.shortDesc}</ui.p>
    </Box>
  );
}

function StatsSection({ pokemon }: { pokemon: Pokemon }) {
  let maxStat = Math.max(
    ...Object.values(pokemon.baseStats).filter((num) => !isNaN(num))
  );

  maxStat = clamp(maxStat, 150, 255);

  return (
    <SectionCard
      title="Base Stats"
      right={
        <Box vfx={{ axis: "x", gap: "xs", align: "center" }}>
          <Badge type="success">Total {pokemon.baseTotal}</Badge>
          <Tooltip
            offset={4}
            tooltipContent="Computed by subtracting unused attack type"
          >
            <Badge type="info">Effective {pokemon.effectiveBaseTotal}</Badge>
          </Tooltip>
        </Box>
      }
    >
      <Box vfx={{ axis: "y", gap: "xs" }}>
        {stats.map((stat) => {
          const value = pokemon.baseStats[stat];
          const widthPct = clamp((value / maxStat) * 100, 2, 100);

          return (
            <Box
              key={stat}
              vfx={{
                axis: "x",
                align: "center",
                justify: "between",
              }}
            >
              <ui.strong vfx={{ color: "muted" }} style={{ width: "12ch" }}>
                {STAT_LABELS[stat].toUpperCase()}
              </ui.strong>
              <Box vfx={{ axis: "x", width: "full", paddingX: "xs" }}>
                <Box
                  vfx={{ radius: "max" }}
                  style={{
                    width: `${widthPct}%`,
                    height: 10,
                    backgroundColor: statColor(value),
                  }}
                />
              </Box>
              <ui.strong vfx={{ textAlign: "right" }} style={{ width: "6ch" }}>
                {value}
              </ui.strong>
            </Box>
          );
        })}
      </Box>
    </SectionCard>
  );
}

function TypeEffectivenessSection({ pokemon }: { pokemon: Pokemon }) {
  const table = useMemo(
    () => computeEffectivenessTable(pokemon.weaknesses),
    [pokemon.weaknesses]
  );

  return (
    <SectionCard title="Type Defenses">
      <TypeEffectivenessGrid table={table} />
    </SectionCard>
  );
}

function TypeEffectivenessGrid({ table }: { table: Record<Type, Multiplier> }) {
  return (
    <Box vfx={{ axis: "x", wrap: true, gap: "s", justify: "center" }}>
      {types.map((type) => {
        const mult = table[type];
        return (
          <Box
            key={type}
            vfx={{
              axis: "y",
              align: "center",
              justify: "center",
              padding: "xs",
            }}
            style={{ width: "10ch" }}
          >
            <TypeBadge type={type} vfx={{ width: "full" }} />
            <ui.span vfx={{ fontWeight: 9 }}>{MULT_LABEL[mult]}</ui.span>
          </Box>
        );
      })}
    </Box>
  );
}

function FlavorSection({ pokemon }: { pokemon: Pokemon }) {
  return (
    <SectionCard title="Description">
      <Box vfx={{ axis: "y", gap: "s" }}>
        <ui.p vfx={{ margin: "none" }}>{pokemon.flavorText.flavor}</ui.p>
        <ui.em vfx={{ color: "muted" }}>
          — Pokémon {pokemon.flavorText.game}
        </ui.em>
      </Box>
    </SectionCard>
  );
}

function Subheader({ children }: { children: string }) {
  return (
    <ui.h2 vfx={{ margin: "none", fontWeight: 9 }}>
      {children.toUpperCase()}
    </ui.h2>
  );
}

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

type WeaknessBucketKey = keyof Pokemon["weaknesses"];

type Multiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4;

const BUCKET_TO_MULT: Record<
  Exclude<WeaknessBucketKey, "normal">,
  Multiplier
> = {
  quad: 4,
  double: 2,
  half: 0.5,
  quarter: 0.25,
  none: 0,
};

const MULT_LABEL: Record<Multiplier, string> = {
  0: "0×",
  0.25: "¼×",
  0.5: "½×",
  1: "1×",
  2: "2×",
  4: "4×",
};

function computeEffectivenessTable(
  weaknesses: Pokemon["weaknesses"]
): Record<Type, Multiplier> {
  const table = Object.fromEntries(types.map((t) => [t, 1])) as Record<
    Type,
    Multiplier
  >;

  (
    Object.keys(BUCKET_TO_MULT) as Exclude<WeaknessBucketKey, "normal">[]
  ).forEach((bucket) => {
    const mult = BUCKET_TO_MULT[bucket];
    weaknesses[bucket].forEach((t) => {
      table[t] = mult;
    });
  });

  weaknesses.normal.forEach((t) => {
    table[t] = 1;
  });

  return table;
}

function statColor(value: number): string {
  if (value < 30) return "#ff4444";
  if (value < 60) return "#ff9000";
  if (value < 90) return "#ffde00";
  if (value < 120) return "#cfef5f";
  if (value < 150) return "#45b86b";
  return "#3a85ff";
}

const STAT_LABELS = {
  hp: "HP",
  speed: "Speed",
  attack: "Attack",
  defense: "Defense",
  specialattack: "Sp. Atk",
  specialdefense: "Sp. Def",
} as const;
