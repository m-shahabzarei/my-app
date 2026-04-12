import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Job, JobSource } from "@/types";
import { fetchAllJobs } from "@/lib/api/jobs";

const PERSIAN_NUMBERS: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

const NORMALIZE_MAP: Record<string, string> = {
  "\u064A": "\u06CC", // ي -> ی
  "\u0643": "\u06A9", // ك -> ک
  "\u0649": "\u06CC", // ى -> ی
  "\u0629": "\u0647", // ة -> ه
  "\u0621": "\u06CC", // ؠ -> ی
  "\u0671": "\u0627", // ٱ -> ا
  "\u0670": "\u0622", // ٰ -> آ
};

function normalizePersianText(text: string): string {
  if (!text) return "";
  return text
    .split("")
    .map((char) => NORMALIZE_MAP[char] || char)
    .join("")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .trim();
}

function parsePersianNumber(text: string): number {
  if (!text) return 0;
  return parseInt(
    text
      .split("")
      .map((char) => PERSIAN_NUMBERS[char] || char)
      .join("")
    .replace(/[^0-9]/g, ""),
    10
  ) || 0;
}

function parseDateToDaysAgo(dateStr: string): number {
  if (!dateStr) return Infinity;
  
  const normalized = normalizePersianText(dateStr);
  
  if (normalized.includes("امروز") || normalized.includes("today")) return 0;
  if (normalized.includes("دیروز") || normalized.includes("yesterday")) return 1;
  
  const numberMatch = normalized.match(/(\d+)/);
  if (!numberMatch) return Infinity;
  
  const num = parsePersianNumber(numberMatch[1]);
  
  if (normalized.includes("سال")) return num * 365;
  if (normalized.includes("ماه")) return num * 30;
  if (normalized.includes("هفته")) return num * 7;
  if (normalized.includes("روز")) return num;
  
  return Infinity;
}

export interface JobFilters {
  search: string;
  source: JobSource | "all";
}

export interface UseJobsOptions {
  debounceMs?: number;
  defaultFilters?: Partial<JobFilters>;
}

export interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  filters: JobFilters;
  setSearch: (value: string) => void;
  setSource: (value: JobSource | "all") => void;
  refetch: () => void;
}

export function useJobsAdvanced(
  activeSources: JobSource[],
  options: UseJobsOptions = {}
): UseJobsReturn {
  const { debounceMs = 300, defaultFilters = {} } = options;
  
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearchState] = useState(defaultFilters.search || "");
  const [searchDebounced, setSearchDebounced] = useState(search);
  const [source, setSource] = useState<JobSource | "all">(defaultFilters.source || "all");
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobs = useCallback(async () => {
    if (activeSources.length === 0) {
      setAllJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllJobs(activeSources);
      setAllJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [activeSources]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setSearchDebounced(search);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search, debounceMs]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
  }, []);

  const setSourceFn = useCallback((value: JobSource | "all") => {
    setSource(value);
  }, []);

  const mergedAndFilteredJobs = useMemo(() => {
    let result = [...allJobs];

    if (source !== "all") {
      result = result.filter((job) => job.source === source);
    }

    return result;
  }, [allJobs, source]);

  const sortedJobs = useMemo(() => {
    return [...mergedAndFilteredJobs].sort((a, b) => {
      const daysA = parseDateToDaysAgo(a.date);
      const daysB = parseDateToDaysAgo(b.date);

      if (daysA !== daysB) {
        return daysA - daysB;
      }

      if (a.source !== b.source) {
        return a.source.localeCompare(b.source);
      }

      return a.id.localeCompare(b.id);
    });
  }, [mergedAndFilteredJobs]);

  const searchResults = useMemo(() => {
    if (!searchDebounced.trim()) {
      return sortedJobs;
    }

    const normalizedSearch = normalizePersianText(searchDebounced.toLowerCase());
    const searchTerms = normalizedSearch.split(/\s+/).filter(Boolean);

    const jobsWithScore = sortedJobs.map((job) => {
      const normalizedTitle = normalizePersianText(job.title.toLowerCase());
      const normalizedCompany = normalizePersianText(job.company.toLowerCase());
      const normalizedLocation = normalizePersianText(job.location.toLowerCase());

      let titleScore = 0;
      let companyScore = 0;
      let locationScore = 0;

      for (const term of searchTerms) {
        if (normalizedTitle.includes(term)) {
          titleScore += term.length * 10;
          if (normalizedTitle.startsWith(term)) {
            titleScore += term.length * 5;
          }
        }
        if (normalizedCompany.includes(term)) {
          companyScore += term.length * 5;
          if (normalizedCompany.startsWith(term)) {
            companyScore += term.length * 3;
          }
        }
        if (normalizedLocation.includes(term)) {
          locationScore += term.length * 2;
        }
      }

      const totalScore = titleScore + companyScore + locationScore;
      return { job, totalScore };
    });

    return jobsWithScore
      .filter(({ totalScore }) => totalScore > 0)
      .sort((a, b) => b.totalScore - a.totalScore)
      .map(({ job }) => job);
  }, [sortedJobs, searchDebounced]);

  const filters = useMemo(
    () => ({
      search,
      source,
    }),
    [search, source]
  );

  return useMemo(
    () => ({
      jobs: searchResults,
      loading,
      error,
      filters,
      setSearch,
      setSource: setSourceFn,
      refetch: fetchJobs,
    }),
    [searchResults, loading, error, filters, setSearch, setSourceFn, fetchJobs]
  );
}
