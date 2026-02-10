import { pokeapi } from "src/api/pokeapi";
import useQuery from "./useQuery";

export default function useListPokemon() {
  const { data, loading, error } = useQuery(() => pokeapi.getAllPokemon(), []);

  return { pokemon: data, loading, error };
}
