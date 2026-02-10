import type { AttackerType, Pokemon, Type, Stat } from "src/utils/types";
import { types as allTypes } from "src/utils/types";
import { typeChart } from "src/data/typeChart";

const SPRITE_BASE = "https://play.pokemonshowdown.com/sprites";

export function computeWeaknessesFromTypes(
  types: Type[],
): Pokemon["weaknesses"] {
  const multipliers = new Map<Type, number>();

  allTypes.forEach((type) => multipliers.set(type, 1));

  const matchup1 = typeChart[types[0]];
  matchup1.doubleDamageFrom.forEach((t) => multipliers.set(t, 2));
  matchup1.halfDamageFrom.forEach((t) => multipliers.set(t, 0.5));
  matchup1.noDamageFrom.forEach((t) => multipliers.set(t, 0));

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
  const { attack, "special-attack": specialAttack } = baseStats;
  let attackerType: AttackerType = "special";
  let effectiveBaseTotal = baseStatsTotal;

  if (specialAttack >= attack) {
    effectiveBaseTotal -= attack;
  } else {
    attackerType = "physical";
    effectiveBaseTotal -= specialAttack;
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
  const missingChars = 4 - str.length;

  return "0".repeat(missingChars) + str;
}

type SpriteVariant = "home-centered";

type SpriteOptions = {
  readonly shiny?: boolean;
  readonly variant?: SpriteVariant;
};

export function buildSprite(key: string, options: SpriteOptions = {}) {
  const { shiny = false, variant = "home-centered" } = options;
  const folder = shiny ? `${variant}-shiny` : variant;
  return `${SPRITE_BASE}/${folder}/${key.replaceAll("-", "")}.png`;
}

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
