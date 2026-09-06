"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Generic {data, loading, error, reload} trio — replaces the same three useState()s +
// useEffect() + load() boilerplate that used to be copy-pasted into every data-fetching page.
export function useAsync(taskFn, { deps = [], immediate = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState("");
  const taskRef = useRef(taskFn);
  taskRef.current = taskFn;

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError("");
    try {
      const result = await taskRef.current(...args);
      setData(result);
      return result;
    } catch (e) {
      setError(e?.message || "Something went wrong");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) run().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, error, setError, reload: run };
}
