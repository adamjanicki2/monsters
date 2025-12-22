import useQuery from "src/hooks/useQuery";
import type { Pokemon as GQLPokemon } from "@favware/graphql-pokemon";
import { convertToPokemonStruct } from "src/utils/helpers";

type Config = {
  key: string;
  properName: string | undefined;
};

export default function useGetPokemon({ key, properName }: Config) {
  // reverse texts to get the original generation description
  const query = `
{
  getPokemon(pokemon: ${key}, reverseFlavorTexts: false) {
    key
    abilities {
      first {
        key
        name
        shortDesc
      }
      hidden {
        key
        name
        shortDesc
      }
      second {
        key
        name
        shortDesc
      }
    }
    baseStats {
      attack
      defense
      hp
      specialattack
      specialdefense
      speed
    }
    baseStatsTotal
    catchRate {
      base
      percentageWithOrdinaryPokeballAtFullHealth
    }
    classification
    evYields {
      attack
      defense
      hp
      specialattack
      specialdefense
      speed
    }
    flavorTexts {
      flavor
      game
    }
    gender {
      female
      male
    }
    height
    num
    otherFormes
    species
    types {
      name
      matchup {
        defending {
          doubleEffectiveTypes
          doubleResistedTypes
          effectiveTypes
          effectlessTypes
          normalTypes
          resistedTypes
        }
      }
    }
    weight
    mythical
    legendary
  }
}
`;

  const { data, loading, error } = useQuery<"getPokemon">({
    query,
    skip: !properName,
  });

  const rawPokemon = data?.getPokemon as GQLPokemon | undefined;

  const pokemon =
    rawPokemon && properName
      ? convertToPokemonStruct(rawPokemon, properName)
      : undefined;

  return {
    pokemon,
    loading,
    error,
  };
}
