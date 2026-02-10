import type {
  AttackerType,
  Pokemon,
  PokemonKey,
  Type,
  Stat,
} from "src/utils/types";
import { types as allTypes } from "src/utils/types";
import { typeChart } from "src/data/typeChart";
import {
  pokeapi,
  type PokeAPIPokemon,
  type PokeAPISpecies,
} from "src/api/pokeapi";
import { species } from "src/data/species";

const SPRITE_BASE = "https://play.pokemonshowdown.com/sprites";

function constructSprites(key: PokemonKey): [string, string] {
  return [
    `${SPRITE_BASE}/home-centered/${key}.png`,
    `${SPRITE_BASE}/home-centered-shiny/${key}.png`,
  ];
}

export function computeWeaknessesFromTypes(
  types: Type[],
): Pokemon["weaknesses"] {
  const multipliers = new Map<Type, number>();

  // Initialize all types to 1x
  allTypes.forEach((type) => multipliers.set(type, 1));

  // Apply type 1 matchups
  const matchup1 = typeChart[types[0]];
  matchup1.doubleDamageFrom.forEach((t) => multipliers.set(t, 2));
  matchup1.halfDamageFrom.forEach((t) => multipliers.set(t, 0.5));
  matchup1.noDamageFrom.forEach((t) => multipliers.set(t, 0));

  // Apply type 2 matchups (multiply)
  if (types[1]) {
    const matchup2 = typeChart[types[1]];
    matchup2.doubleDamageFrom.forEach((t) =>
      multipliers.set(t, multipliers.get(t)! * 2),
    );
    matchup2.halfDamageFrom.forEach((t) =>
      multipliers.set(t, multipliers.get(t)! * 0.5),
    );
    matchup2.noDamageFrom.forEach((t) => multipliers.set(t, 0));
  }

  // Group by multiplier value
  const quad: Type[] = [];
  const double: Type[] = [];
  const normal: Type[] = [];
  const half: Type[] = [];
  const quarter: Type[] = [];
  const none: Type[] = [];

  multipliers.forEach((mult, type) => {
    if (mult === 4) quad.push(type);
    else if (mult === 2) double.push(type);
    else if (mult === 1) normal.push(type);
    else if (mult === 0.5) half.push(type);
    else if (mult === 0.25) quarter.push(type);
    else if (mult === 0) none.push(type);
  });

  return { quad, double, normal, half, quarter, none };
}

export function computeAttackingInfo(pokemon: {
  baseStats: Record<Stat, number>;
  baseStatsTotal: number;
}) {
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

export function formatMeters(meters: number) {
  const feet = meters * 3.28084;
  const flooredFeet = Math.floor(feet);

  const inches = Math.floor((feet - flooredFeet) * 12);

  return `${flooredFeet}'${inches}"`;
}

export function formatKg(kg: number) {
  return `${(kg * 2.20462).toFixed(1)} lbs`;
}

export function removeNonAlphanumeric(value: string) {
  return value.replace(/[^a-z0-9]/gi, "");
}

export function idify(str: string) {
  return str
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
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
  `${SPRITE_BASE}/home-centered/${key}.png`;

export function partition<K extends string, T extends object>(
  arr: T[],
  partitionKey: (item: T) => K,
): Map<K, T[]> {
  const map = new Map<K, T[]>();
  arr.forEach((item) => {
    const key = partitionKey(item);
    const items = map.get(key) || [];
    items.push(item);
    map.set(key, items);
  });

  return map;
}

function formatAbilityName(key: string): string {
  return key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function calculateCatchRatePercentage(captureRate: number): string {
  // Formula: (captureRate / 255) * 100 at full HP with Pokeball
  const percentage = (captureRate / 255) * 100;
  return `${percentage.toFixed(1)}%`;
}

function convertAbility(
  abilitySlot: any,
  abilityData: any,
): Pokemon["abilities"]["first"] | null {
  if (!abilitySlot || !abilityData) return null;

  const effectEntry = abilityData.effect_entries.find(
    (e: any) => e.language.name === "en",
  );

  return {
    key: abilitySlot.ability.name,
    name: formatAbilityName(abilitySlot.ability.name),
    shortDesc: effectEntry?.short_effect || "",
  };
}

export async function convertPokeAPIToPokemon(
  pokemonData: PokeAPIPokemon,
  speciesData: PokeAPISpecies,
  properName: string,
  key: PokemonKey,
): Promise<Pokemon> {
  // Extract stats
  const statsMap = new Map(
    pokemonData.stats.map((s: any) => [
      s.stat.name.replace("-", ""), // "special-attack" → "specialattack"
      s.base_stat,
    ]),
  );

  const baseStats: Record<Stat, number> = {
    hp: statsMap.get("hp")!,
    attack: statsMap.get("attack")!,
    defense: statsMap.get("defense")!,
    specialattack: statsMap.get("specialattack")!,
    specialdefense: statsMap.get("specialdefense")!,
    speed: statsMap.get("speed")!,
  };

  const baseStatsTotal = Object.values(baseStats).reduce((a, b) => a + b, 0);

  // Extract types
  const types = pokemonData.types
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name as Type);

  // Compute weaknesses using type chart
  const weaknesses = computeWeaknessesFromTypes(types);

  // Fetch abilities (need to make additional requests)
  const abilitiesData = await Promise.all(
    pokemonData.abilities
      .slice(0, 3)
      .map((a) => pokeapi.getAbility(a.ability.name)),
  );

  const abilities = {
    first: convertAbility(
      pokemonData.abilities.find((a) => a.slot === 1),
      abilitiesData.find((_, i) => pokemonData.abilities[i].slot === 1),
    )!,
    second: convertAbility(
      pokemonData.abilities.find((a) => a.slot === 2),
      abilitiesData.find((_, i) => pokemonData.abilities[i].slot === 2),
    ),
    hidden: convertAbility(
      pokemonData.abilities.find((a) => a.is_hidden),
      abilitiesData.find((_, i) => pokemonData.abilities[i].is_hidden),
    ),
  };

  // Extract flavor text
  const flavorEntry = speciesData.flavor_text_entries.find(
    (e) => e.language.name === "en",
  );
  const flavorText = {
    flavor: flavorEntry?.flavor_text.replace(/\n|\f/g, " ") || "",
    game: flavorEntry?.version.name || "",
  };

  // Gender ratio (-1 = genderless)
  const genderRate = speciesData.gender_rate;
  const gender =
    genderRate === -1
      ? null
      : {
          male: `${(((8 - genderRate) / 8) * 100).toFixed(1)}%`,
          female: `${((genderRate / 8) * 100).toFixed(1)}%`,
        };

  // Rarity
  const rarity = speciesData.is_mythical
    ? "mythical"
    : speciesData.is_legendary
      ? "legendary"
      : null;

  // Sprites (keep using Showdown)
  const [sprite, shinySprite] = constructSprites(key);

  // EV yields
  const evYields: Record<Stat, number> = Object.fromEntries(
    pokemonData.stats.map((s) => [s.stat.name.replace("-", ""), s.effort]),
  ) as Record<Stat, number>;

  // Compute attacking info
  const { attackerType, effectiveBaseTotal } = computeAttackingInfo({
    baseStats,
    baseStatsTotal,
  } as any);

  // Get alternate forms from species data
  const speciesInfo = species[pokemonData.name];
  const variants = (speciesInfo?.altForms || []) as PokemonKey[];

  return {
    key,
    name: properName,
    desc: speciesData.genera.find((g) => g.language.name === "en")?.genus || "",
    abilities,
    attackerType,
    baseStats,
    baseTotal: baseStatsTotal,
    effectiveBaseTotal,
    evolutionLevel: null, // Not available from PokeAPI without evolution chain
    evYields,
    flavorText,
    gender,
    height: pokemonData.height / 10, // decimeters → meters
    weight: pokemonData.weight / 10, // hectograms → kg
    dexNumber: speciesData.id,
    variants,
    sprite,
    shinySprite,
    weaknesses,
    rarity,
    type: types as [Type] | [Type, Type],
    catchRate: [
      speciesData.capture_rate,
      calculateCatchRatePercentage(speciesData.capture_rate),
    ],
  };
}
