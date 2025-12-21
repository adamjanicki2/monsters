import useQuery from "src/hooks/useQuery";
import type { Pokemon as GQLPokemon } from "@favware/graphql-pokemon";
import { convertToPokemonStruct } from "src/utils/helpers";

type Config = {
  key: string;
  properName: string | undefined;
};

export default function useGetPokemon({ key, properName }: Config) {
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
    cry
    evolutionLevel
    preevolutions {
      key
      sprite
      evolutionLevel
      learnsets {
        generation7 {
          eggMoves {
            move {
              key
              accuracy
              basePower
              bulbapediaPage
              category
              contestType
              desc
              isFieldMove
              isGMax
              isNonstandard
              isZ
              maxMovePower
              name
              pp
              priority
              serebiiPage
              shortDesc
              smogonPage
              target
              type
              zMovePower
            }
          }
        }
      }
    }
    evolutions {
      evolutionLevel
      key
      sprite
    }
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
    isEggObtainable
    levellingRate
    num
    learnsets {
      generation7 {
        eggMoves {
          move {
            key
            accuracy
            basePower
            category
            desc
            name
            pp
            priority
            shortDesc
            target
            type
            zMovePower
          }
        }
        tmMoves {
          move {
            key
            accuracy
            basePower
            category
            desc
            name
            pp
            priority
            shortDesc
            target
            type
            zMovePower
          }
        }
        tutorMoves {
          move {
            key
            accuracy
            basePower
            category
            desc
            name
            pp
            priority
            shortDesc
            target
            type
            zMovePower
          }
        }
      }
    }
    otherFormes
    shinySprite
    species
    sprite
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
