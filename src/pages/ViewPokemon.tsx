import { Alert, Spinner, Box, ui, Badge } from "@adamjanicki/ui";
import { useParams } from "react-router";
import Page from "src/components/Page";
import useGetPokemon from "src/hooks/useGetPokemon";
import NotFound from "src/pages/NotFound";
import { getProperName, stats } from "src/utils/pokemon";
import type { Pokemon, Type } from "src/utils/types";

export default function ViewPokemon() {
  const params = useParams<{ slug: string }>();
  const key = params.slug!;
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
      <Box
        vfx={{
          axis: "y",
          gap: "l",
          padding: "l",
          maxWidth: "max",
          marginX: "auto",
        }}
      >
        <Header pokemon={pokemon} name={properName} />
        {loading || !pokemon ? (
          <Spinner />
        ) : (
          <>
            <TopSection pokemon={pokemon} />
            <StatsSection pokemon={pokemon} />
            <WeaknessesSection pokemon={pokemon} />
            <FlavorSection pokemon={pokemon} />
            <EvolutionsSection pokemon={pokemon} />
            <VariantsSection pokemon={pokemon} />
          </>
        )}
      </Box>
    </Page>
  );
}

/* ---------------------------------- */
/* Header                              */
/* ---------------------------------- */

function Header({ pokemon, name }: { pokemon?: Pokemon } & { name: string }) {
  return (
    <Box vfx={{ axis: "x", justify: "between", align: "center" }}>
      <Box vfx={{ axis: "x", align: "center", gap: "s" }}>
        <ui.h1 className="page-title-text">{name}</ui.h1>
        {pokemon && (
          <ui.span vfx={{ fontSize: "s", color: "muted" }}>
            #{pokemon.dexNumber}
          </ui.span>
        )}
      </Box>

      {pokemon && pokemon.rarity && (
        <Badge type="success">{pokemon.rarity.toUpperCase()}</Badge>
      )}
    </Box>
  );
}

/* ---------------------------------- */
/* Top Section                         */
/* ---------------------------------- */

function TopSection({ pokemon }: { pokemon: Pokemon }) {
  return (
    <Box vfx={{ axis: "x", gap: "xl", align: "start", wrap: true }}>
      <Sprites pokemon={pokemon} />
      <BasicInfo pokemon={pokemon} />
    </Box>
  );
}

/* ---------------------------------- */
/* Sprites                             */
/* ---------------------------------- */

function Sprites({ pokemon }: { pokemon: Pokemon }) {
  return (
    <Box
      vfx={{
        axis: "y",
        gap: "s",
        align: "center",
        padding: "m",
        border: true,
        radius: "rounded",
        backgroundColor: "default",
      }}
    >
      <ui.img src={pokemon.sprite} alt={pokemon.name} />
      <ui.img src={pokemon.shinySprite} alt={`${pokemon.name} shiny`} />
    </Box>
  );
}

/* ---------------------------------- */
/* Basic Info                          */
/* ---------------------------------- */

function BasicInfo({ pokemon }: { pokemon: Pokemon }) {
  const { first, second, hidden } = pokemon.abilities;

  return (
    <Box vfx={{ axis: "y", gap: "m", maxWidth: "max" }}>
      <Section title="Physical">
        <ui.p>Height: {pokemon.height} m</ui.p>
        <ui.p>Weight: {pokemon.weight} kg</ui.p>
        {pokemon.gender && (
          <ui.p>
            Gender: ♂ {pokemon.gender.male} / ♀ {pokemon.gender.female}
          </ui.p>
        )}
      </Section>

      <Section title="Abilities">
        <Ability ability={first} />
        {second && <Ability ability={second} />}
        {hidden && <Ability ability={hidden} label="Hidden" />}
      </Section>
    </Box>
  );
}

function Ability({
  ability,
  label,
}: {
  ability: Pokemon["abilities"]["first"];
  label?: string;
}) {
  return (
    <Box vfx={{ axis: "y", gap: "xxs" }}>
      <Box vfx={{ axis: "x", gap: "xs", align: "center" }}>
        <ui.strong>{ability.name}</ui.strong>
        {label && (
          <ui.span vfx={{ fontSize: "xs", color: "muted" }}>({label})</ui.span>
        )}
      </Box>
      <ui.p vfx={{ fontSize: "s", color: "muted" }}>{ability.shortDesc}</ui.p>
    </Box>
  );
}

/* ---------------------------------- */
/* Stats                               */
/* ---------------------------------- */

function StatsSection({ pokemon }: { pokemon: Pokemon }) {
  return (
    <Section title="Base Stats">
      <Box vfx={{ axis: "y", gap: "xs" }}>
        {stats.map((stat) => {
          const value = pokemon.baseStats[stat];
          return (
            <Box key={stat} vfx={{ axis: "x", gap: "s", align: "center" }}>
              <ui.span vfx={{ width: "fit", fontSize: "s" }}>{stat}</ui.span>

              <Box
                vfx={{
                  height: "min",
                  width: "full",
                  backgroundColor: "muted",
                  radius: "subtle",
                }}
              >
                <Box
                  vfx={{
                    height: "full",
                    radius: "subtle",
                    backgroundColor: "default",
                  }}
                  style={{ width: `${Math.min(value, 200) / 2}%` }}
                />
              </Box>

              <ui.span vfx={{ fontSize: "s" }}>{value}</ui.span>
            </Box>
          );
        })}
      </Box>

      <ui.p vfx={{ marginTop: "s", fontWeight: 6 }}>
        Total: {pokemon.baseTotal} (Effective {pokemon.effectiveBaseTotal})
      </ui.p>
    </Section>
  );
}

/* ---------------------------------- */
/* Weaknesses                          */
/* ---------------------------------- */

function WeaknessesSection({ pokemon }: { pokemon: Pokemon }) {
  const entries: [keyof Pokemon["weaknesses"], string][] = [
    ["quad", "4×"],
    ["double", "2×"],
    ["half", "½×"],
    ["normal", "1x"],
    ["quarter", "¼×"],
    ["none", "0×"],
  ];

  return (
    <Section title="Type Effectiveness">
      <Box vfx={{ axis: "y", gap: "s" }}>
        {entries.map(([key, label]) => {
          const types = pokemon.weaknesses[key];
          if (!types.length) return null;

          return (
            <Box key={key} vfx={{ axis: "x", gap: "s", align: "center" }}>
              <ui.strong>{label}</ui.strong>
              <TypeList types={types} />
            </Box>
          );
        })}
      </Box>
    </Section>
  );
}

function TypeList({ types }: { types: readonly Type[] }) {
  return (
    <Box vfx={{ axis: "x", gap: "xs", wrap: true }}>
      {types.map((type) => (
        <Box
          key={type}
          vfx={{
            paddingX: "s",
            paddingY: "xxs",
            border: true,
            radius: "subtle",
            fontSize: "xs",
          }}
        >
          {type}
        </Box>
      ))}
    </Box>
  );
}

/* ---------------------------------- */
/* Flavor                              */
/* ---------------------------------- */

function FlavorSection({ pokemon }: { pokemon: Pokemon }) {
  return (
    <Section title={pokemon.desc}>
      <ui.p>{pokemon.flavorText.flavor}</ui.p>
      <ui.p vfx={{ fontSize: "s", color: "muted", italics: true }}>
        — Pokémon {pokemon.flavorText.game}
      </ui.p>
    </Section>
  );
}

/* ---------------------------------- */
/* Evolutions                          */
/* ---------------------------------- */

function EvolutionsSection({ pokemon }: { pokemon: Pokemon }) {
  if (!pokemon.evolutions.length && !pokemon.preevolutions.length) return null;

  return (
    <Section title="Evolution Line">
      <Box vfx={{ axis: "x", gap: "m", wrap: true }}>
        {pokemon.preevolutions.map(renderEvolution)}
        {renderEvolution({
          key: pokemon.key,
          sprite: pokemon.sprite,
          evolutionLevel: pokemon.evolutionLevel,
        })}
        {pokemon.evolutions.map(renderEvolution)}
      </Box>
    </Section>
  );
}

function renderEvolution(p: {
  key: string;
  sprite: string;
  evolutionLevel?: string | null;
}) {
  return (
    <Box key={p.key} vfx={{ axis: "y", align: "center", gap: "xs" }}>
      <ui.img src={p.sprite} alt={p.key} />
      <ui.span>{p.key}</ui.span>
      {p.evolutionLevel && (
        <ui.span vfx={{ fontSize: "xs", color: "muted" }}>
          Lv. {p.evolutionLevel}
        </ui.span>
      )}
    </Box>
  );
}

/* ---------------------------------- */
/* Variants                            */
/* ---------------------------------- */

function VariantsSection({ pokemon }: { pokemon: Pokemon }) {
  if (!pokemon.variants.length) return null;

  return (
    <Section title="Variants">
      <Box vfx={{ axis: "x", gap: "s", wrap: true }}>
        {pokemon.variants.map((variant) => (
          <Box
            key={variant}
            vfx={{
              paddingX: "s",
              paddingY: "xxs",
              border: true,
              radius: "subtle",
            }}
          >
            {variant}
          </Box>
        ))}
      </Box>
    </Section>
  );
}

/* ---------------------------------- */
/* Generic Section Wrapper             */
/* ---------------------------------- */

function Section({
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
      }}
    >
      <ui.h2>{title}</ui.h2>
      {children}
    </Box>
  );
}
