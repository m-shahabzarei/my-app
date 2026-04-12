import { useState, useEffect, useCallback, useMemo } from "react";
import { Job, JobSource } from "@/types";
import { fetchAllJobs } from "@/lib/api/jobs";

interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useJobs(activeSources: JobSource[]): UseJobsReturn {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (activeSources.length === 0) {
      setJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllJobs(activeSources);
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [activeSources]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return useMemo(
    () => ({
      jobs,
      loading,
      error,
      refetch: fetchJobs,
    }),
    [jobs, loading, error, fetchJobs]
  );
}