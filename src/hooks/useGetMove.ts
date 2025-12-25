import useQuery from "src/hooks/useQuery";
import { Category, Move, Type } from "src/utils/types";
import { MoveKey } from "src/data/moves";

type Config = {
  key: string;
  accuracy: number | true | undefined;
};

export default function useGetMove({ key, accuracy }: Config) {
  const query = `
{
  getMove(move: ${key}) {
    accuracy
    basePower
    category
    desc
    key
    name
    pp
    priority
    shortDesc
    target
    type
    zMovePower
  }
}
`;

  const skip = accuracy === undefined;
  const { data, loading, error } = useQuery<"getMove">({ query, skip });

  let move: Move | undefined;
  const gqlMove = data?.getMove;

  if (gqlMove && accuracy !== undefined) {
    move = {
      key: key as MoveKey,
      accuracy,
      power: Number(gqlMove.basePower),
      name: gqlMove.name,
      type: gqlMove.type.toLowerCase() as Type,
      category: gqlMove.category.toLowerCase() as Category,
      pp: gqlMove.pp,
      desc: gqlMove.desc || gqlMove.shortDesc,
      priority: gqlMove.priority,
      zPower: gqlMove.zMovePower,
      target: gqlMove.target,
    };
  }

  return {
    move,
    loading,
    error,
  };
}
