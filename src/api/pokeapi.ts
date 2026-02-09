export interface PokeAPIPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: { name: string };
  }>;
  types: Array<{
    slot: number;
    type: { name: string };
  }>;
  abilities: Array<{
    ability: { name: string; url: string };
    is_hidden: boolean;
    slot: number;
  }>;
  sprites: {
    front_default: string;
  };
}

export interface PokeAPISpecies {
  id: number;
  name: string;
  gender_rate: number;
  capture_rate: number;
  is_legendary: boolean;
  is_mythical: boolean;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }>;
  genera: Array<{
    genus: string;
    language: { name: string };
  }>;
}

export interface PokeAPIMove {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number;
  priority: number;
  damage_class: { name: string };
  type: { name: string };
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: { name: string };
  }>;
  target: { name: string };
}

export interface PokeAPIAbility {
  name: string;
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: { name: string };
  }>;
}

export interface PokeAPIPokemonList {
  count: number;
  results: Array<{
    name: string;
    url: string;
  }>;
}

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

class PokeAPIClient {
  private cache = new Map<string, any>();

  private async fetchWithCache<T>(url: string): Promise<T> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PokeAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    this.cache.set(url, data);
    return data;
  }

  async getPokemon(nameOrId: string | number): Promise<PokeAPIPokemon> {
    return this.fetchWithCache(`${POKEAPI_BASE}/pokemon/${nameOrId}/`);
  }

  async getPokemonSpecies(nameOrId: string | number): Promise<PokeAPISpecies> {
    return this.fetchWithCache(`${POKEAPI_BASE}/pokemon-species/${nameOrId}/`);
  }

  async getMove(nameOrId: string | number): Promise<PokeAPIMove> {
    return this.fetchWithCache(`${POKEAPI_BASE}/move/${nameOrId}/`);
  }

  async getAbility(nameOrId: string | number): Promise<PokeAPIAbility> {
    return this.fetchWithCache(`${POKEAPI_BASE}/ability/${nameOrId}/`);
  }

  async getAllPokemon(limit = 1025): Promise<PokeAPIPokemonList> {
    return this.fetchWithCache(`${POKEAPI_BASE}/pokemon?limit=${limit}`);
  }
}

export const pokeapi = new PokeAPIClient();
