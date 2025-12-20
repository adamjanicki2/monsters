import { usePost } from "src/hooks/useFetch";

export default function usePokemon(name: string) {
  name = name.toLowerCase();
  const { loading, data } = usePost({
    endpoint: "https://graphqlpokemon.favware.tech/v8",
    body: {
      query: `
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
    `,
    },
  });

  const pokemon = data?.data?.getPokemon;

  return { pokemon, loading };
}
