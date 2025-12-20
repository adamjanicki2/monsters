export const types = [
  "normal",
  "fighting",
  "flying",
  "poison",
  "ground",
  "rock",
  "bug",
  "ghost",
  "steel",
  "fire",
  "water",
  "grass",
  "electric",
  "psychic",
  "ice",
  "dragon",
  "dark",
  "fairy",
] as const;

export type Type = typeof types[number];
export type Ability = {
  name: string;
  hidden: boolean;
};

export type Pokemon = {
  images: {
    regular: string;
    shiny: string;
  };
  stats: {
    hp: number;
    atk: number;
    spAtk: number;
    def: number;
    spDef: number;
    spe: number;
  };
  height: number;
  weight: number;
  generation: number;
  description: string;
  captureRate: number;
  abilities: Ability[];
  legendary: boolean;
  mythical: boolean;
  types: Type[];
};
