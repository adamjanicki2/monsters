import type {
  Pokemon as GQLPokemon,
  PokemonType as GQLPokemonType,
} from "@favware/graphql-pokemon";
import type { AttackerType, Pokemon, PokemonKey, Type } from "src/utils/types";
import { types as allTypes } from "src/utils/pokemon";

const SPRITE_BASE = "https://play.pokemonshowdown.com/sprites";

function constructSprites(key: PokemonKey): [string, string] {
  return [
    `${SPRITE_BASE}/home-centered/${key}.png`,
    `${SPRITE_BASE}/home-centered-shiny/${key}.png`,
  ];
}

function computeWeaknesses(
  types: readonly GQLPokemonType[]
): Pokemon["weaknesses"] {
  const [type1, type2] = types;

  if (!type2) {
    return {
      quad: [],
      double: type1.matchup.defending.effectiveTypes as Type[],
      normal: type1.matchup.defending.normalTypes as Type[],
      half: type1.matchup.defending.resistedTypes as Type[],
      quarter: [],
      none: type1.matchup.defending.effectlessTypes as Type[],
    };
  }

  const buildMultiplierMap = (type: GQLPokemonType): Record<Type, number> => {
    const map: Partial<Record<Type, number>> = {};

    for (const t of type.matchup.defending.effectiveTypes as Type[]) {
      map[t] = 2;
    }
    for (const t of type.matchup.defending.normalTypes as Type[]) {
      map[t] = 1;
    }
    for (const t of type.matchup.defending.resistedTypes as Type[]) {
      map[t] = 0.5;
    }
    for (const t of type.matchup.defending.effectlessTypes as Type[]) {
      map[t] = 0;
    }

    return map as Record<Type, number>;
  };

  const map1 = buildMultiplierMap(type1);
  const map2 = buildMultiplierMap(type2);

  const weaknesses: Record<keyof Pokemon["weaknesses"], Type[]> = {
    quad: [],
    double: [],
    normal: [],
    half: [],
    quarter: [],
    none: [],
  };

  for (const attackingType of allTypes) {
    const m1 = map1[attackingType] ?? 1;
    const m2 = map2[attackingType] ?? 1;
    const multiplier = m1 * m2;

    if (multiplier === 4) weaknesses.quad.push(attackingType);
    else if (multiplier === 2) weaknesses.double.push(attackingType);
    else if (multiplier === 1) weaknesses.normal.push(attackingType);
    else if (multiplier === 0.5) weaknesses.half.push(attackingType);
    else if (multiplier === 0.25) weaknesses.quarter.push(attackingType);
    else if (multiplier === 0) weaknesses.none.push(attackingType);
  }

  return weaknesses;
}

export function computeAttackingInfo(pokemon: GQLPokemon) {
  const { baseStats, baseStatsTotal } = pokemon;
  const { attack, specialattack } = baseStats;
  let attackerType: AttackerType = "special";
  let effectiveBaseTotal = baseStatsTotal;

  if (specialattack >= attack) {
    effectiveBaseTotal -= attack;
  } else {
    attackerType = "physical";
    effectiveBaseTotal -= specialattack;
  }

  return {
    attackerType,
    effectiveBaseTotal,
  };
}

export function convertToPokemonStruct(
  pokemon: GQLPokemon,
  name: string
): Pokemon {
  const { baseStats, baseStatsTotal } = pokemon;
  const { attackerType, effectiveBaseTotal } = computeAttackingInfo(pokemon);
  const key = pokemon.key.valueOf() as PokemonKey;
  const [sprite, shinySprite] = constructSprites(key);

  const ungendered =
    pokemon.gender.female === pokemon.gender.male &&
    pokemon.gender.male === "0%";

  return {
    key,
    name,
    desc: pokemon.classification || "No description exists.",
    abilities: {
      first: pokemon.abilities.first,
      second: pokemon.abilities.second,
      hidden: pokemon.abilities.hidden,
    },
    attackerType,
    baseStats,
    baseTotal: baseStatsTotal,
    effectiveBaseTotal,
    evolutionLevel: pokemon.evolutionLevel,
    evYields: pokemon.evYields,
    flavorText: pokemon.flavorTexts[0],
    gender: ungendered ? null : pokemon.gender,
    height: pokemon.height,
    weight: pokemon.weight,
    dexNumber: pokemon.num,
    variants: (pokemon.otherFormes || []) as PokemonKey[],
    sprite,
    shinySprite,
    weaknesses: computeWeaknesses(pokemon.types),
    rarity: pokemon.mythical
      ? "mythical"
      : pokemon.legendary
      ? "legendary"
      : null,
    type: [
      pokemon.types[0].name.toLowerCase(),
      pokemon.types[1]?.name?.toLowerCase(),
    ].filter(Boolean) as unknown as Pokemon["type"],
    catchRate: [
      pokemon.catchRate!.base,
      pokemon.catchRate!.percentageWithOrdinaryPokeballAtFullHealth,
    ],
  };
}

export function formatMeters(meters: number) {
  const feet = meters * 3.28084;
  const flooredFeet = Math.floor(feet);

  const inches = Math.floor((feet - flooredFeet) * 12);

  return `${flooredFeet}'${inches}"`;
}

export function formatKg(kg: number) {
  return `${(kg * 2.20462).toFixed(1)} lbs`;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function padDexNumber(dexNo: number): string {
  const str = `${dexNo}`;
  const missingChars = 3 - str.length;

  return "0".repeat(missingChars) + str;
}

export const makeIconSprite = (key: string) =>
  `https://play.pokemonshowdown.com/sprites/dex/${key}.png`;
