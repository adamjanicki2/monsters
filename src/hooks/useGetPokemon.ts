import { useState, useEffect } from "react";
import { pokeapi } from "src/api/pokeapi";
import { convertPokeAPIToPokemon } from "src/utils/helpers";
import type { Pokemon, PokemonKey } from "src/utils/types";
import { species } from "src/data/species";

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

        // Get the species data to find the dex number
        const speciesInfo = species[key];
        if (!speciesInfo) {
          throw new Error(`Species data not found for ${key}`);
        }

        // Determine which identifier to use for pokemon endpoint
        // Use baseForm if it exists, otherwise use dex number
        const pokemonIdentifier = speciesInfo.baseForm || speciesInfo.dexNumber;

        // Fetch species data using dex number (more reliable)
        // Fetch pokemon form data using baseForm or dex number
        const [speciesData, pokemonData] = await Promise.all([
          pokeapi.getPokemonSpecies(speciesInfo.dexNumber),
          pokeapi.getPokemon(pokemonIdentifier),
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
