import { pokeapi } from "src/api/pokeapi";
import type { SpeciesKey } from "src/utils/types";
import useQuery from "src/hooks/useQuery";

type Config = {
  key: string;
  properName?: string;
};

export default function useGetPokemon({ key, properName }: Config) {
  const { data, loading, error } = useQuery(
    () => pokeapi.getPokemon(key as SpeciesKey, properName!),
    [key, properName],
    !!properName,
  );

  return { pokemon: data, loading, error };
}
