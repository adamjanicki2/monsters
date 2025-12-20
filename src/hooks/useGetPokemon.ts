import useQuery from "src/hooks/useQuery";
import type { Pokemon } from "@favware/graphql-pokemon";

export default function useGetPokemon(name: string) {
  const query = `
    {
        getPokemon(pokemon: ${name}) {
            backSprite
            baseForme
            baseSpecies
            baseStats {
                attack
                defense
                hp
                specialattack
                specialdefense
                speed
            }
            catchRate {
                base
                percentageWithOrdinaryPokeballAtFullHealth
            }
            classification
            cosmeticFormes
            cry
            evolutionLevel
            evolutions {
                key
                classification
                num
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
            forme
            formeLetter
            gender {
                female
                male
            }
            height
            num
            otherFormes
            preevolutions {
                key
                classification
                num
                sprite
            }
            shinySprite
            species
            sprite
            types {
            name
            }
            weight
            mythical
            legendary
        }
        }
  `;

  const { data, loading, error } = useQuery<"getPokemon">(query);

  return {
    pokemon: data?.getPokemon as Pokemon | undefined,
    loading,
    error,
  };
}
