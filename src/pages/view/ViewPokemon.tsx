import React, { useMemo, useState } from "react";
import {
  Alert,
  Spinner,
  Box,
  ui,
  Badge,
  Button,
  Icon,
  assertDefined,
} from "@adamjanicki/ui";
import { Tooltip } from "@adamjanicki/ui-extended";
import { useParams } from "react-router";
import Page from "src/components/Page";
import useGetPokemon from "src/hooks/useGetPokemon";
import NotFound from "src/pages/NotFound";
import { getProperName, stats, types } from "src/utils/pokemon";
import type { Pokemon, PokemonFragment, Type } from "src/utils/types";
import Link from "src/components/Link";
import "src/pages/view/ViewPokemon.css";
import { formatKg, formatMeters } from "src/utils/helpers";

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
            <Evolutions pokemon={pokemon} />
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
        vfx={{ fontWeight: 8, margin: "none" }}
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
        gap: "l",
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
          <ui.h2 vfx={{ margin: "none" }}>No. {pokemon.dexNumber}</ui.h2>
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
      <Box vfx={{ axis: "y", gap: "l" }} style={{ flex: 1, minWidth: 320 }}>
        <StatsSection pokemon={pokemon} />
        <FlavorSection pokemon={pokemon} />
      </Box>

      <Box vfx={{ axis: "y", gap: "l" }} style={{ width: "min(520px, 100%)" }}>
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
        <ui.h2 vfx={{ margin: "none" }}>{title}</ui.h2>
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
            <ui.span vfx={{ fontWeight: 6 }}>{v}</ui.span>
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
      <ui.h2 vfx={{ margin: "none" }}>Abilities</ui.h2>
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
      <Box vfx={{ axis: "x", gap: "xs", align: "center", wrap: true }}>
        <ui.strong>{ability.name}</ui.strong>
        <ui.span vfx={{ fontSize: "s", color: "muted" }}>({label})</ui.span>
      </Box>
      <ui.p vfx={{ color: "muted" }}>{ability.shortDesc}</ui.p>
    </Box>
  );
}

function StatsSection({ pokemon }: { pokemon: Pokemon }) {
  let maxStat = Math.max(
    ...Object.values(pokemon.baseStats).filter((num) => !isNaN(num))
  );

  maxStat = clamp(maxStat + 10, 150, 255);

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
                gap: "s",
                align: "center",
                width: "full",
                justify: "between",
              }}
            >
              <Box
                vfx={{ axis: "x", width: "full", align: "center", gap: "s" }}
              >
                <ui.span
                  vfx={{ color: "muted", fontWeight: 5 }}
                  // Defense is 7 chars, then one extra padding
                  style={{ width: "8ch" }}
                >
                  {STAT_LABELS[stat].toUpperCase()}
                </ui.span>
                <Box
                  vfx={{ radius: "max" }}
                  style={{
                    width: `${widthPct}%`,
                    height: 10,
                    backgroundColor: statColor(value),
                  }}
                />
              </Box>
              <ui.span vfx={{ fontWeight: 6 }}>{value}</ui.span>
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
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        gap: 8,
      }}
    >
      {types.map((t) => {
        const mult = table[t];
        return (
          <Box
            key={t}
            vfx={{
              axis: "y",
              align: "center",
              justify: "center",
              padding: "xs",
              radius: "subtle",
              border: true,
            }}
            style={{
              minHeight: 54,
              textTransform: "capitalize",
            }}
          >
            <ui.span vfx={{ fontWeight: 7 }}>{t}</ui.span>
            <ui.span vfx={{ fontSize: "s", color: "muted" }}>
              {MULT_LABEL[mult]}
            </ui.span>
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
        <ui.p>{pokemon.flavorText.flavor}</ui.p>
        <ui.em vfx={{ color: "muted" }}>
          — Pokémon {pokemon.flavorText.game}
        </ui.em>
      </Box>
    </SectionCard>
  );
}

function Evolutions({ pokemon }: { pokemon: Pokemon }) {
  const hasEvo =
    pokemon.evolutions.length > 0 || pokemon.preevolutions.length > 0;

  if (!hasEvo) return null;

  const line: PokemonFragment[] = [
    ...pokemon.preevolutions,
    {
      key: pokemon.key,
      sprite: pokemon.sprite,
      shinySprite: pokemon.shinySprite,
      evolutionLevel: pokemon.evolutionLevel,
    },
    ...pokemon.evolutions,
  ];

  return (
    <SectionCard title="Evolution Line">
      <Box vfx={{ axis: "x", gap: "m", wrap: true, align: "center" }}>
        {line.map((p, i) => (
          <React.Fragment key={p.key}>
            <EvolutionNode pokemon={p} current={p.key === pokemon.key} />
            {i < line.length - 1 && (
              <Box vfx={{ axis: "y", align: "center", justify: "center" }}>
                <Icon icon="arrow-right" size="xs" />
                <ui.span vfx={{ fontSize: "s", color: "muted" }}>
                  Lv. {line[i + 1].evolutionLevel}
                </ui.span>
              </Box>
            )}
          </React.Fragment>
        ))}
      </Box>
    </SectionCard>
  );
}

function EvolutionNode({
  pokemon,
  current,
}: {
  pokemon: PokemonFragment;
  current: boolean;
}) {
  const innerContent = (
    <Box
      className={current ? "evo-current" : undefined}
      vfx={{
        axis: "y",
        align: "center",
        gap: "xs",
        padding: "s",
        border: true,
        radius: "rounded",
        backgroundColor: "default",
      }}
      style={{ width: 140 }}
    >
      <ui.img className="evo-sprite" src={pokemon.sprite} alt={pokemon.key} />
      <ui.span vfx={{ fontSize: "s", fontWeight: 7, textAlign: "center" }}>
        {getProperName(pokemon.key)}
      </ui.span>
    </Box>
  );

  if (current) {
    return innerContent;
  }
  return (
    <Link
      className="aui-dim"
      vfx={{ color: "default" }}
      to={`/dex/${pokemon.key}`}
    >
      {innerContent}
    </Link>
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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

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
  if (value < 30) return "var(--stat-red)";
  if (value < 60) return "var(--stat-orange)";
  if (value < 90) return "var(--stat-yellow)";
  if (value < 120) return "var(--stat-yellow-green)";
  if (value < 150) return "var(--stat-green)";
  return "var(--stat-blue)";
}

const STAT_LABELS = {
  hp: "HP",
  speed: "Speed",
  attack: "Attack",
  defense: "Defense",
  specialattack: "Sp. Atk",
  specialdefense: "Sp. Def",
} as const;
