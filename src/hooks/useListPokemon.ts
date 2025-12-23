import useQuery from "src/hooks/useQuery";
import type { Pokemon as GQLPokemon } from "@favware/graphql-pokemon";
import { computeAttackingInfo, makeIconSprite } from "src/utils/helpers";
import { pokemon as dex, PokemonKey, Type } from "src/utils/pokemon";
import { PokemonFragment } from "src/utils/types";

export default function useListPokemon() {
  const query = `
{
  getAllPokemon {
    key
    baseStatsTotal
    num
    baseStats {
      attack
      specialattack
    }
    types {
      name
    }
  }
}
  `;

  const { data, loading, error } = useQuery<"getAllPokemon">({ query });

  const rawPokemon = data?.getAllPokemon as readonly GQLPokemon[] | undefined;

  const pokemon = rawPokemon
    ? (rawPokemon
        .map((pokemon) => {
          const key = pokemon.key as PokemonKey;
          const name = dex[key] as string | undefined;
          if (!name) return null;
          return {
            name,
            key,
            dexNumber: pokemon.num,
            baseTotal: pokemon.baseStatsTotal,
            sprite: makeIconSprite(pokemon.key),
            type: pokemon.types.map(
              (type) => type.name.toLowerCase() as Type
            ) as unknown as PokemonFragment["type"],
            ...computeAttackingInfo(pokemon),
          };
        })
        .filter(Boolean) as PokemonFragment[])
    : undefined;

  return { pokemon, loading, error };
}
