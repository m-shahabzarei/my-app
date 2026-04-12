export const runtime = "nodejs";

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { Job } from "@/types";

interface JobinjaJob {
  title: string;
  company: string;
  location: string;
  job_url: string;
  job_id: string;
  is_remote: boolean;
  tags: string[];
  posted_time: string | null;
}

// ---------------- PARSER ----------------
function parseJobinjaHTML(html: string): JobinjaJob[] {
  const $ = cheerio.load(html);
  const jobs: JobinjaJob[] = [];

  $(".o-listView__item").each((_, el) => {
    const element = $(el);

    try {
      // ---------------- link + title ----------------
      const linkEl = element.find(".c-jobListView__titleLink");
      const jobUrl = linkEl.attr("href");
      if (!jobUrl) return;

      const fullUrl = jobUrl.startsWith("http")
        ? jobUrl
        : `https://jobinja.ir${jobUrl}`;

      const title = linkEl.text().trim();

      // ---------------- meta ----------------
      const metaItems = element.find(".c-jobListView__metaItem");

      // شرکت
      const company = metaItems.eq(0).find("span").first().text().trim();

      // شهر
      const location = metaItems.eq(1).find("span").first().text().trim();

      // 🎯 مهم: نوع همکاری + remote
      let workType = "";
      let isRemote = false;

      const workSpan = metaItems.eq(2).find("span span").first();

      if (workSpan.length) {
        const rawText = workSpan.text().replace(/\s+/g, " ").trim();

        workType = rawText;

        if (rawText.includes("دورکاری")) {
          isRemote = true;
        }
      }

      // تاریخ (امروز / دیروز ...)
      const posted_time = element
        .find(".c-jobListView__passedDays")
        .text()
        .replace(/[()]/g, "")
        .trim() || null;

      // job id
      const jobIdMatch = fullUrl.match(/\/jobs\/([^\/]+)/);
      const jobId = jobIdMatch ? jobIdMatch[1] : "";

      // tags
      const tags: string[] = [];
      element.find(".c-tag").each((_, tag) => {
        const text = $(tag).text().trim();
        if (text) tags.push(text);
      });

      jobs.push({
        title,
        company: company || "نامشخص",
        location: location || "نامشخص",
        job_url: fullUrl,
        job_id: jobId,
        is_remote: isRemote,
        tags,
        posted_time: posted_time || workType || "نامشخص", // fallback
      });
    } catch {
      return;
    }
  });

  return jobs;
}

// ---------------- TRANSFORM ----------------
function transformJobinjaJob(item: JobinjaJob): Job {
  return {
    id: `jobinja-${item.job_id}`,
    title: item.title,
    company: item.company || "نامشخص",
    location: item.location || "نامشخص",
    source: "jobinja",
    date: item.posted_time || "نامشخص",
    url: item.job_url,
    isRemote: item.is_remote,
  };
}

// ---------------- API ----------------
export async function POST() {
  try {
    const url =
      "https://jobinja.ir/jobs?filters%5Bkeywords%5D%5B0%5D=&preferred_before=1775980065&filters%5Bkeywords%5D%5B0%5D=&filters%5Bjob_categories%5D%5B0%5D=%D9%88%D8%A8%D8%8C%E2%80%8C+%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D9%87%E2%80%8C%D9%86%D9%88%DB%8C%D8%B3%DB%8C+%D9%88+%D9%86%D8%B1%D9%85%E2%80%8C%D8%A7%D9%81%D8%B2%D8%A7%D8%B1&filters%5Bremote%5D=1&sort_by=relevance_desc&_pjax=%23js-jobSeekerSearchResult";

    console.log("🔍 Fetching Jobinja...");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html",
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Fetch error:", text.slice(0, 300));

      return NextResponse.json(
        { success: false, error: "Fetch failed" },
        { status: response.status }
      );
    }

    const html = await response.text();

    console.log("📦 HTML length:", html.length);

    const parsedJobs = parseJobinjaHTML(html);

    console.log("✅ Parsed jobs:", parsedJobs.length);
    console.log("🧪 Sample job:", parsedJobs[0]);

    const jobs = parsedJobs.map(transformJobinjaJob);

    return NextResponse.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("🔥 API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}