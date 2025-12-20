import { useEffect, useState } from "react";

type Result = {
  loading: boolean;
  data: Record<string, any> | null;
};

type PostConfig = {
  endpoint: string;
  body: Record<string, any>;
};

export function usePost({ endpoint, body }: PostConfig): Result {
  const [result, setResult] = useState<Result>({
    data: null,
    loading: true,
  });

  const stringifiedBody = JSON.stringify(body);

  useEffect(() => {
    const executeSearch = async () => {
      setResult((prev) => ({ ...prev, loading: true }));

      let json = null;
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: stringifiedBody,
        });
        json = await res.json();
      } catch (e) {
        console.error(e);
      }

      setResult({ data: json, loading: false });
    };

    executeSearch();
  }, [endpoint, stringifiedBody]);

  return result;
}
