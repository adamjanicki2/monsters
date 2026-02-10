import { useState, useEffect } from "react";
import { pokeapi } from "src/api/pokeapi";
import type { PokemonFragment } from "src/utils/types";

export default function useListPokemon() {
  const [data, setData] = useState<PokemonFragment[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        setLoading(true);
        const fragments = await pokeapi.getAllPokemon();
        setData(fragments);
        setError(undefined);
      } catch (e) {
        setError(`Failed to fetch Pokemon list: ${(e as Error).message}`);
        setData(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPokemon();
  }, []);

  return { pokemon: data, loading, error };
}
