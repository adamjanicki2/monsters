import { pokeapi } from "src/api/pokeapi";
import type { SpeciesKey } from "src/utils/types";
import useQuery from "src/hooks/useQuery";

type Config = {
  key: string;
  form?: string;
  skip: boolean;
};

export default function useGetPokemon({ key, form, skip }: Config) {
  const { data, loading, error } = useQuery(
    () => pokeapi.getPokemon(key as SpeciesKey, form),
    [key, form],
    !skip,
  );

  return { pokemon: data, loading, error };
}
