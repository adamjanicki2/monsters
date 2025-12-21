import { gql, type ErrorLike } from "@apollo/client";
import { useQuery as useApolloQuery } from "@apollo/client/react";
import type { Query } from "@favware/graphql-pokemon";

type QueryOperation = keyof Query;

type GQLResponse<T extends QueryOperation> = Record<T, Query[T]>;

type Response<T extends QueryOperation> = {
  data?: GQLResponse<T>;
  loading: boolean;
  error?: string;
};

function formatError(error?: ErrorLike) {
  if (error) {
    return `Error (${error.name}): ${error.message}`;
  }

  return undefined;
}

type Config = {
  query: string;
  skip?: boolean;
};

export default function useQuery<T extends QueryOperation>({
  query,
  skip,
}: Config): Response<T> {
  const { loading, error, data } = useApolloQuery<GQLResponse<T>>(gql(query), {
    skip,
  });
  return { loading, error: formatError(error), data };
}
