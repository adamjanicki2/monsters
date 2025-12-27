import type { MoveKey } from "src/data/moves";
import type { PokemonKey } from "src/data/pokemon";

export const types = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export const stats = [
  "hp",
  "attack",
  "defense",
  "specialattack",
  "specialdefense",
  "speed",
] as const;

type Stat = (typeof stats)[number];

type Type = (typeof types)[number];

type Optional<T> = T | null | undefined;

type Ability = {
  readonly key: string;
  readonly name: string;
  readonly shortDesc: string;
};

type Rarity = "mythical" | "legendary";
type Category = "physical" | "special" | "status";
type AttackerType = "physical" | "special";

type Pokemon = {
  readonly key: PokemonKey;
  readonly name: string;
  readonly desc: string;
  readonly abilities: {
    readonly first: Ability;
    readonly second: Optional<Ability>;
    readonly hidden: Optional<Ability>;
  };
  readonly attackerType: AttackerType;
  readonly baseStats: Record<Stat, number>;
  readonly baseTotal: number;
  readonly effectiveBaseTotal: number;
  readonly evolutionLevel: Optional<string>;
  readonly evYields: Record<Stat, number>;
  readonly flavorText: {
    readonly flavor: string;
    readonly game: string;
  };
  readonly gender: Optional<{
    readonly male: string;
    readonly female: string;
  }>;
  readonly height: number;
  readonly weight: number;
  readonly dexNumber: number;
  readonly variants: PokemonKey[];
  readonly sprite: string;
  readonly shinySprite: string;
  readonly weaknesses: {
    readonly quad: readonly Type[];
    readonly double: readonly Type[];
    readonly normal: readonly Type[];
    readonly half: readonly Type[];
    readonly quarter: readonly Type[];
    readonly none: readonly Type[];
  };
  readonly rarity: Optional<Rarity>;
  readonly type: readonly [Type] | readonly [Type, Type];
  readonly catchRate: readonly [number, string];
};

type PokemonFragment = Pick<
  Pokemon,
  | "key"
  | "name"
  | "effectiveBaseTotal"
  | "baseTotal"
  | "sprite"
  | "type"
  | "dexNumber"
>;

type Move = {
  readonly key: MoveKey;
  readonly name: string;
  readonly accuracy: number | true;
  readonly power: number;
  readonly category: Category;
  readonly priority: number;
  readonly pp: number;
  readonly type: Type;
  readonly zPower: number;
  readonly target: string;
  readonly desc: string;
};

type MoveFragment = Pick<
  Move,
  "key" | "name" | "accuracy" | "power" | "category" | "type"
>;

export type {
  PokemonKey,
  Pokemon,
  PokemonFragment,
  Category,
  Rarity,
  Ability,
  Type,
  Stat,
  Move,
  MoveFragment,
  AttackerType,
};
