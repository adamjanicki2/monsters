import { pokeapi } from "src/api/pokeapi";
import type { PokemonKey } from "src/utils/types";
import useQuery from "./useQuery";

type Config = {
  key: string;
  properName?: string;
};

export default function useGetPokemon({ key, properName }: Config) {
  const { data, loading, error } = useQuery(
    () => pokeapi.getPokemonFull(key as PokemonKey, properName!),
    [key, properName],
    !!properName,
  );

  return { pokemon: data, loading, error };
}
