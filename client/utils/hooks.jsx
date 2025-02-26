import { useState, useEffect } from "react";

export function useLoader(fetchFunction) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchFunction();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [fetchFunction]); // Runs only when fetchFunction changes

  return { loading, error, data };
}
