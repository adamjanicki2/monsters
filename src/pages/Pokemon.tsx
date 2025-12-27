import React, { useMemo, useState } from "react";
import {
  Alert,
  Spinner,
  Box,
  ui,
  Button,
  assertDefined,
  Icon,
  Select,
  useScrollToHash,
} from "@adamjanicki/ui";
import { Tooltip } from "@adamjanicki/ui-extended";
import { useParams } from "react-router";
import Page from "src/components/Page";
import useGetPokemon from "src/hooks/useGetPokemon";
import NotFound from "src/pages/NotFound";
import dex, { PokemonKey, pokemonKeys } from "src/data/pokemon";
import {
  type Pokemon,
  type Type,
  type Stat,
  type PokemonFragment,
  stats,
  types,
  MoveFragment,
} from "src/utils/types";
import { clamp, formatKg, formatMeters, padDexNumber } from "src/utils/helpers";
import TypeBadge from "src/components/TypeBadge";
import BigBadge from "src/components/BigBadge";
import Link, { UnstyledLink } from "src/components/Link";
import Header, { CopyableSubheader, Subheader } from "src/components/Header";
import SimpleTable from "src/components/SimpleTable";
import useGetMoveset from "src/hooks/useGetMoveset";
import generations, { Generation } from "src/data/generations";

export default function Pokemon() {
  const params = useParams<{ slug: string }>();
  const key = assertDefined(params.slug);
  const properName = dex[key as PokemonKey] as string | undefined;

  const { pokemon, loading, error } = useGetPokemon({ key, properName });
  const movesResult = useGetMoveset({
    key: key as PokemonKey,
    skip: !properName,
  });

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
        <PageHeader pokemon={pokemon} name={properName} />
        {loading || !pokemon ? (
          <Box vfx={{ width: "full" }}>
            <Spinner />
          </Box>
        ) : (
          <BodyContainer pokemon={pokemon} movesResult={movesResult} />
        )}
      </Box>
    </Page>
  );
}

function BodyContainer({
  pokemon,
  movesResult,
}: {
  pokemon: Pokemon;
  movesResult: ReturnType<typeof useGetMoveset>;
}) {
  useScrollToHash({ delay: 100 });

  return (
    <>
      <NeighborLinks pokemon={pokemon} />
      <IntroInfo pokemon={pokemon} />
      <StatsSection pokemon={pokemon} />
      <FlavorSection pokemon={pokemon} />
      <TypeEffectivenessSection pokemon={pokemon} />
      <MovesSection {...movesResult} />
    </>
  );
}

function NeighborLinks({ pokemon }: { pokemon: Pokemon }) {
  const index = pokemon.dexNumber - 1;

  const prevIndex = index - 1;
  const nextIndex = index + 1;

  const hasPrev = index > 0;
  const hasNext = index < pokemonKeys.length - 1;

  const commonLinkVfx = { axis: "x", align: "center", gap: "xs" } as const;

  const renderNeighbor = (dir: "prev" | "next") => {
    const isPrev = dir === "prev";
    const neighborIndex = isPrev ? prevIndex : nextIndex;
    const key = pokemonKeys[neighborIndex];

    return (
      <Link to={`/dex/${key}`} vfx={commonLinkVfx}>
        {isPrev && <Icon icon="chevron-left" />}#
        {padDexNumber(neighborIndex + 1)} {dex[key]}
        {!isPrev && <Icon icon="chevron-right" />}
      </Link>
    );
  };

  const justify = hasPrev && hasNext ? "between" : hasNext ? "end" : "start";

  return (
    <Box vfx={{ axis: "x", align: "center", width: "full", justify }}>
      {hasPrev && renderNeighbor("prev")}
      {hasNext && renderNeighbor("next")}
    </Box>
  );
}

function PageHeader({ pokemon, name }: { pokemon?: Pokemon; name: string }) {
  return (
    <Box vfx={{ axis: "x", align: "center", gap: "m", wrap: true }}>
      <Header>{name}</Header>
      {pokemon && pokemon.rarity && (
        <BigBadge vfx={{ height: "fit" }} type="success">
          {pokemon.rarity}
        </BigBadge>
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

        <SimpleTable
          rows={[
            ["Height", formatMeters(pokemon.height)],
            ["Weight", formatKg(pokemon.weight)],
            pokemon.gender
              ? [
                  "Breeding",
                  `${pokemon.gender.male} M / ${pokemon.gender.female} F`,
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
            [
              "EVs",
              Object.entries(pokemon.evYields)
                .map(([stat, value]) => {
                  if (value >= 1)
                    return `${value} ${STAT_LABELS[stat as Stat]}`;
                  else return "";
                })
                .filter(Boolean)
                .join(", "),
            ],
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

function SectionCard({
  title,
  children,
}: {
  title: string;
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
      <CopyableSubheader>{title}</CopyableSubheader>
      {children}
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

  const [badgeType, tooltipContent] = getEffectiveBadgeInfo(pokemon);

  return (
    <SectionCard title="Base Stats">
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
                  vfx={{ radius: "max", shadow: "subtle" }}
                  style={{
                    width: `${widthPct}%`,
                    height: 12,
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
      <Box
        vfx={{
          axis: "x",
          align: "center",
          justify: "between",
          borderTop: true,
          paddingTop: "xs",
        }}
      >
        <ui.strong vfx={{ color: "muted" }}>TOTAL</ui.strong>
        <Box vfx={{ axis: "x", align: "center", gap: "s" }}>
          <Tooltip offset={4} tooltipContent={tooltipContent}>
            <BigBadge type={badgeType}>
              {"EFFECTIVE " + pokemon.effectiveBaseTotal}
            </BigBadge>
          </Tooltip>
          <ui.strong>{pokemon.baseTotal}</ui.strong>
        </Box>
      </Box>
    </SectionCard>
  );
}

export function getEffectiveBadgeInfo(pokemon: Pokemon | PokemonFragment) {
  const diff = pokemon.baseTotal - pokemon.effectiveBaseTotal;
  if (diff <= 60)
    return [
      "success",
      <>
        Nice! <ui.strong>{pokemon.name}</ui.strong> is either efficient or bad
      </>,
    ] as const;
  if (diff <= 100)
    return [
      "warning",
      <>
        Not bad, but <ui.strong>{pokemon.name}</ui.strong> is wasting power
      </>,
    ] as const;
  return [
    "error",
    <>
      Oh no! <ui.strong>{pokemon.name}</ui.strong> is probably a mixed-attacker
    </>,
  ] as const;
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
        const [label, color] = MULT_LABEL[mult];
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
            <ui.span style={{ color }} vfx={{ fontWeight: 9 }}>
              {label}
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
        <ui.p vfx={{ margin: "none" }}>{pokemon.flavorText.flavor}</ui.p>
        <ui.em vfx={{ color: "muted" }}>
          — Pokémon {pokemon.flavorText.game}
        </ui.em>
      </Box>
    </SectionCard>
  );
}

function MovesSection({
  loading,
  error,
  moves,
}: ReturnType<typeof useGetMoveset>) {
  const [generation, setGeneration] = useState<Generation>(7);

  if (loading) {
    return (
      <SectionCard title="Movesets">
        <Spinner />
      </SectionCard>
    );
  }

  if (error || !moves) {
    return (
      <SectionCard title="Movesets">
        <Alert type="error">
          {error || "There was an error loading movesets"}
        </Alert>
      </SectionCard>
    );
  }

  const missingKeys: string[] = [];
  const movesetForGeneration = moves.get(generation) || [];
  const generationOptions = generations.filter(
    (key) => moves.get(key) && assertDefined(moves.get(key)).length > 0
  );

  return (
    <SectionCard title="Movesets">
      <Select
        value={String(generation)}
        options={generationOptions.map(String)}
        onChange={(e) => setGeneration(Number(e.target.value) as Generation)}
        getOptionLabel={(value) => `GEN ${value}`}
      />
      {missingKeys.length > 0 && (
        <Alert type="warning">
          Missing the following keys: {missingKeys.join(", ")}
        </Alert>
      )}
      {movesetForGeneration.length <= 0 ? (
        <Alert type="warning">
          No moves could be found in Gen {generation}.
        </Alert>
      ) : (
        <Box vfx={{ axis: "y" }}>
          {movesetForGeneration.map((move) => (
            <MoveItem move={move} key={move.key} />
          ))}
        </Box>
      )}
    </SectionCard>
  );
}

function MoveItem({ move }: { move: MoveFragment }) {
  const { name, type, category, power, accuracy, key } = move;
  let accuracyLabel: React.ReactNode = accuracy;
  if (accuracy === true && category === "status") {
    accuracyLabel = "—";
  } else if (accuracy === true) {
    accuracyLabel = "∞";
  }

  return (
    <UnstyledLink
      to={`/move/${key}`}
      vfx={{
        axis: "x",
        align: "center",
        gap: "xs",
        width: "full",
        padding: "s",
        radius: "rounded",
      }}
      className="hover-background"
    >
      <ui.strong style={{ flex: 1 }}>{name}</ui.strong>
      <TypeBadge type={type} />
      <ui.span style={{ width: "15ch" }}>{category}</ui.span>
      <ui.span style={{ width: "4ch" }}>{power <= 0 ? "—" : power}</ui.span>
      <ui.span style={{ width: "4ch" }}>{accuracyLabel}</ui.span>
    </UnstyledLink>
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

const COLORS = {
  red: "#ff4444",
  orange: "#ff9000",
  yellow: "#ffde00",
  yellowGreen: "#cfef5f",
  green: "#45b86b",
  blue: "#3a85ff",
} as const;

function statColor(value: number): string {
  if (value < 30) return COLORS.red;
  if (value < 60) return COLORS.orange;
  if (value < 90) return COLORS.yellow;
  if (value < 120) return COLORS.yellowGreen;
  if (value < 150) return COLORS.green;
  return COLORS.blue;
}

const MULT_LABEL: Record<Multiplier, [string, string]> = {
  0: ["0×", COLORS.blue],
  0.25: ["¼×", "#209246"],
  0.5: ["½×", "#9fc809"],
  1: ["1×", "#ceb40e"],
  2: ["2×", "#bb6d07"],
  4: ["4×", "#950909"],
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

const STAT_LABELS = {
  hp: "HP",
  speed: "Speed",
  attack: "Attack",
  defense: "Defense",
  specialattack: "Sp. Atk",
  specialdefense: "Sp. Def",
} as const;
