import type { PokemonKey, Type, Stat } from "src/utils/pokemon";

type Optional<T> = T | null | undefined;

type Ability = {
  readonly key: string;
  readonly name: string;
  readonly shortDesc: string;
};

type Rarity = "mythical" | "legendary";
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
  "key" | "name" | "effectiveBaseTotal" | "baseTotal" | "sprite" | "type"
>;

export type {
  PokemonKey,
  Pokemon,
  PokemonFragment,
  Type,
  AttackerType,
  Rarity,
  Ability,
  Stat,
};
