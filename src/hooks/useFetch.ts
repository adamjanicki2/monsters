import { useEffect, useRef, useState } from "react";

const base = "https://pokeapi.co/api/v2";

type Result = {
  loading: boolean;
  data: Record<string, any> | null;
};

export default function useFetch(slug: string): Result {
  const url = base + slug;
  const controllerRef = useRef<AbortController | null>(null);

  const [result, setResult] = useState<Result>({
    data: null,
    loading: true,
  });

  useEffect(() => {
    const executeSearch = async () => {
      setResult((prev) => ({ ...prev, loading: true }));
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }

      controllerRef.current = new AbortController();

      let json = null;
      try {
        const res = await fetch(url, {
          signal: controllerRef.current.signal,
        });
        json = await res.json();
      } catch (error: any) {
        if (error?.name === "AbortError") return;
      }

      setResult({ data: json, loading: false });
    };

    executeSearch();
  }, [url]);

  return result;
}
