"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import { useJobsAdvanced } from "@/hooks/useJobsAdvanced";
import { useJobSourceStore } from "@/store/useJobSourceStore";
import { JobSource } from "@/types";

export default function JobsPage() {
  const { activeSources, loadFromStorage } = useJobSourceStore();
  const {
    jobs,
    loading,
    error,
    filters,
    setSearch,
    setSource,
  } = useJobsAdvanced(activeSources as JobSource[]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-6">Job Listings</h1>
        <Loader />
      </div>
    );
  }

  if (activeSources.length === 0) {
    return (
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-6">Job Listings</h1>
        <EmptyState
          title="No sources enabled"
          message="Enable job sources from the settings page to see job listings."
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Job Listings</h1>
        <Link
          href="/settings/jobs"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Configure Sources →
        </Link>
      </div>

      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Search jobs..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-700"
        />

        <div className="flex gap-3 flex-wrap">
          <select
            value={filters.source}
            onChange={(e) => setSource(e.target.value as JobSource | "all")}
            className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-gray-700"
          >
            <option value="all">All Sources</option>
            <option value="jobinja">Jobinja</option>
            <option value="jobvision">Jobvision</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-4 border border-gray-800 rounded-2xl animate-pulse"
            >
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Error" message={error} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          message={
            filters.search || filters.source !== "all"
              ? "No jobs match your search criteria."
              : "No jobs available from the enabled sources."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
