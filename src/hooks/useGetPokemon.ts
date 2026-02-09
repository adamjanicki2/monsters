import { useState, useEffect } from "react";
import { pokeapi } from "src/api/pokeapi";
import { convertPokeAPIToPokemon } from "src/utils/helpers";
import type { Pokemon, PokemonKey } from "src/utils/types";

type Config = {
  key: string;
  properName?: string;
};

export default function useGetPokemon({ key, properName }: Config) {
  const [pokemon, setPokemon] = useState<Pokemon | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!properName) {
      setLoading(false);
      return;
    }

    const fetchPokemon = async () => {
      try {
        setLoading(true);

        // Fetch both pokemon and species data in parallel
        const [pokemonData, speciesData] = await Promise.all([
          pokeapi.getPokemon(key),
          pokeapi.getPokemonSpecies(key),
        ]);

        const transformed = await convertPokeAPIToPokemon(
          pokemonData,
          speciesData,
          properName,
          key as PokemonKey
        );

        setPokemon(transformed);
        setError(undefined);
      } catch (e) {
        setError(`Failed to fetch Pokemon: ${(e as Error).message}`);
        setPokemon(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [key, properName]);

  return { pokemon, loading, error };
}
