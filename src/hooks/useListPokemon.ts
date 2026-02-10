import { useState, useEffect } from "react";
import { pokeapi } from "src/api/pokeapi";
import pokemon from "src/data/pokemon";
import type { PokemonFragment, PokemonKey } from "src/utils/types";

export default function useListPokemon() {
  const [data, setData] = useState<PokemonFragment[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        setLoading(true);

        // Get list of all Pokemon
        const listResponse = await pokeapi.getAllPokemonList();

        // Filter to only base forms we have in our pokemon.ts data
        const pokemonKeys = Object.keys(pokemon) as PokemonKey[];
        const relevantPokemon = listResponse.results.filter((p) =>
          pokemonKeys.includes(p.name as PokemonKey)
        );

        // Fetch fragments for each Pokemon
        const fragmentsPromises = relevantPokemon.map((p) =>
          pokeapi.getPokemonFragment(
            p.name as PokemonKey,
            pokemon[p.name as PokemonKey]
          )
        );
        const fragments = await Promise.all(fragmentsPromises);

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
