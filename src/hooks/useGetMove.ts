import { pokeapi } from "src/api/pokeapi";
import { MoveKey } from "src/data/moves";
import useQuery from "src/hooks/useQuery";

type Config = {
  key: string;
  skip: boolean;
};

export default function useGetMove({ key, skip }: Config) {
  const { data, loading, error } = useQuery(
    () => pokeapi.getMove(key as MoveKey),
    [key],
    !skip,
  );

  return { move: data, loading, error };
}
