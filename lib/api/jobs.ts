import { Job, JobSource } from "@/types";

export async function fetchJobinjaJobs(): Promise<Job[]> {
  try {
    const response = await fetch("/api/jobs/jobinja", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data.success || !data.jobs) {
      console.error("Jobinja API error:", data.error);
      return [];
    }

    return data.jobs;
  } catch (error) {
    console.error("Failed to fetch Jobinja jobs:", error);
    return [];
  }
}

export async function fetchJobvisionJobs(): Promise<Job[]> {
  try {
    const response = await fetch("/api/jobs/jobvision", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data.success || !data.jobs) {
      console.error("Jobvision API error:", data.error);
      return [];
    }

    return data.jobs;
  } catch (error) {
    console.error("Failed to fetch Jobvision jobs:", error);
    return [];
  }
}

export async function fetchAllJobs(activeSources: JobSource[]): Promise<Job[]> {
  const jobs: Job[] = [];

  if (activeSources.includes("jobinja")) {
    const jobinjaData = await fetchJobinjaJobs();
    jobs.push(...jobinjaData);
  }

  if (activeSources.includes("jobvision")) {
    const jobvisionData = await fetchJobvisionJobs();
    jobs.push(...jobvisionData);
  }

  return jobs.sort((a, b) => b.date.localeCompare(a.date));
}