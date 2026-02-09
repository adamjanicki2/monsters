import { Type } from "src/utils/types";

export type TypeMatchup = {
  doubleDamageFrom: Type[];
  halfDamageFrom: Type[];
  noDamageFrom: Type[];
};

export const typeChart: Record<Type, TypeMatchup> = {
  normal: {
    doubleDamageFrom: ["fighting"],
    halfDamageFrom: [],
    noDamageFrom: ["ghost"],
  },
  fire: {
    doubleDamageFrom: ["water", "ground", "rock"],
    halfDamageFrom: ["fire", "grass", "ice", "bug", "steel", "fairy"],
    noDamageFrom: [],
  },
  water: {
    doubleDamageFrom: ["electric", "grass"],
    halfDamageFrom: ["fire", "water", "ice", "steel"],
    noDamageFrom: [],
  },
  electric: {
    doubleDamageFrom: ["ground"],
    halfDamageFrom: ["electric", "flying", "steel"],
    noDamageFrom: [],
  },
  grass: {
    doubleDamageFrom: ["fire", "ice", "poison", "flying", "bug"],
    halfDamageFrom: ["water", "electric", "grass", "ground"],
    noDamageFrom: [],
  },
  ice: {
    doubleDamageFrom: ["fire", "fighting", "rock", "steel"],
    halfDamageFrom: ["ice"],
    noDamageFrom: [],
  },
  fighting: {
    doubleDamageFrom: ["flying", "psychic", "fairy"],
    halfDamageFrom: ["bug", "rock", "dark"],
    noDamageFrom: [],
  },
  poison: {
    doubleDamageFrom: ["ground", "psychic"],
    halfDamageFrom: ["grass", "fighting", "poison", "bug", "fairy"],
    noDamageFrom: [],
  },
  ground: {
    doubleDamageFrom: ["water", "grass", "ice"],
    halfDamageFrom: ["poison", "rock"],
    noDamageFrom: ["electric"],
  },
  flying: {
    doubleDamageFrom: ["electric", "ice", "rock"],
    halfDamageFrom: ["grass", "fighting", "bug"],
    noDamageFrom: ["ground"],
  },
  psychic: {
    doubleDamageFrom: ["bug", "ghost", "dark"],
    halfDamageFrom: ["fighting", "psychic"],
    noDamageFrom: [],
  },
  bug: {
    doubleDamageFrom: ["fire", "flying", "rock"],
    halfDamageFrom: ["grass", "fighting", "ground"],
    noDamageFrom: [],
  },
  rock: {
    doubleDamageFrom: ["water", "grass", "fighting", "ground", "steel"],
    halfDamageFrom: ["normal", "fire", "poison", "flying"],
    noDamageFrom: [],
  },
  ghost: {
    doubleDamageFrom: ["ghost", "dark"],
    halfDamageFrom: ["poison", "bug"],
    noDamageFrom: ["normal", "fighting"],
  },
  dragon: {
    doubleDamageFrom: ["ice", "dragon", "fairy"],
    halfDamageFrom: ["fire", "water", "electric", "grass"],
    noDamageFrom: [],
  },
  dark: {
    doubleDamageFrom: ["fighting", "bug", "fairy"],
    halfDamageFrom: ["ghost", "dark"],
    noDamageFrom: ["psychic"],
  },
  steel: {
    doubleDamageFrom: ["fire", "fighting", "ground"],
    halfDamageFrom: [
      "normal",
      "grass",
      "ice",
      "flying",
      "psychic",
      "bug",
      "rock",
      "dragon",
      "steel",
      "fairy",
    ],
    noDamageFrom: ["poison"],
  },
  fairy: {
    doubleDamageFrom: ["poison", "steel"],
    halfDamageFrom: ["fighting", "bug", "dark"],
    noDamageFrom: ["dragon"],
  },
};
