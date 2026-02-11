import { useState, useEffect } from "react";

type UseQueryResult<T> = {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
};

export default function useQuery<T>(
  queryFn: () => Promise<T>,
  deps: Array<string | undefined>,
  enabled = true,
): UseQueryResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await queryFn();
        setData(result);
        setError(undefined);
      } catch (error) {
        setError((error as Error).message);
        setData(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  return { data, loading, error };
}
