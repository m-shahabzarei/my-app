export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { Job } from "@/types";

interface JobvisionResponse {
  success: boolean;
  data?: {
    jobPosts: JobvisionJob[];
  };
  error?: string;
}

interface JobvisionJob {
  id: number;
  title: string;
  company: {
    nameFa: string;
    nameEn: string;
    logoUrl?: string;
  };
  location: {
    province: {
      titleFa: string;
    };
    city: {
      titleFa: string;
    };
  };
  activationTime: {
    date: string;
  };
  properties: {
    isRemote?: boolean;
    linkOutAddress?: string;
  };
  workType: {
    titleFa: string;
  };
  seniorityLevel: {
    titleFa: string;
  };
}

function safeText(value: string | null | undefined): string {
  return value || "";
}

function getDaysAgo(dateString: string): string {
  const activationDate = new Date(dateString);
  const now = new Date();
  
  const activationTime = activationDate.getTime();
  const nowTime = now.getTime();
  
  const diffTime = nowTime - activationTime;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const activationDateStart = new Date(activationDate.toDateString());
  const nowDateStart = new Date(now.toDateString());
  const dayDiff = Math.floor((nowDateStart.getTime() - activationDateStart.getTime()) / (1000 * 60 * 60 * 24));
  
  if (dayDiff === 0) return "امروز";
  if (dayDiff === 1) return "دیروز";
  if (dayDiff < 7) return `${dayDiff} روز پیش`;
  if (dayDiff < 30) return `${Math.floor(dayDiff / 7)} هفته پیش`;
  if (dayDiff < 365) return `${Math.floor(dayDiff / 30)} ماه پیش`;
  return `${Math.floor(dayDiff / 365)} سال پیش`;
}

function transformJobvisionJob(item: JobvisionJob): Job {
  const province = safeText(item.location?.province?.titleFa);
  const city = safeText(item.location?.city?.titleFa);
  const location = province && city ? `${province}، ${city}` : province || city || "نامشخص";

  const url = item.properties?.linkOutAddress 
    ? item.properties.linkOutAddress 
    : `https://jobvision.ir/jobs/${item.id}`;

  const company = item.company?.nameFa || item.company?.nameEn || "شرکت نامشخص";

  return {
    id: `jobvision-${item.id}`,
    title: safeText(item.title),
    company,
    location,
    source: "jobvision",
    date: item.activationTime?.date 
      ? getDaysAgo(item.activationTime.date)
      : "نامشخص",
    url,
    isRemote: item.properties?.isRemote || false,
    workType: safeText(item.workType?.titleFa),
    seniority: safeText(item.seniorityLevel?.titleFa),
  };
}

export async function POST(request: Request) {
  const token = process.env.JOBVISION_TOKEN;

  console.log("Jobvision API - Token available:", !!token);

  if (!token) {
    return NextResponse.json(
      { success: false, error: "API token not configured" },
      { status: 500 }
    );
  }

  console.log("Jobvision API - Token preview:", token.slice(0, 20) + "...");

  try {
    const body = {
      pageSize: 50,
      requestedPage: 1,
      sortBy: 1,
      jobCategoryUrlTitle: "developer",
      isRemote: true,
      searchId: null,
    };

    console.log("Jobvision API - Making request to external API...");
    console.log("Request body:", JSON.stringify(body));
    console.log("AUTH HEADER:", `Bearer ${token}`);
    const response = await fetch("https://candidateapi.jobvision.ir/api/v1/JobPost/List", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      credentials: "omit",
    });

    console.log("Jobvision API - Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Jobvision API - Error response:", errorText);
      return NextResponse.json(
        { success: false, error: `API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data: JobvisionResponse = await response.json();

    console.log("Jobvision API - Raw response:", JSON.stringify(data));
    console.log("Jobvision API - success:", data.success);
    console.log("Jobvision API - data:", data.data);
    console.log("Jobvision API - jobPosts:", data.data?.jobPosts);

    if (!data.data?.jobPosts || !Array.isArray(data.data.jobPosts)) {
      console.log("Jobvision API - Invalid response structure:", data);
      return NextResponse.json(
        { success: false, error: "Invalid API response", details: data },
        { status: 500 }
      );
    }

    console.log("Jobvision API - Transforming jobs...");
    const jobs = data.data.jobPosts.map(transformJobvisionJob);
    console.log("Jobvision API - Jobs transformed:", jobs.length);
    console.log("Jobvision API - First job:", jobs[0]);

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error("Jobvision API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}