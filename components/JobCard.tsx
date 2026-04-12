import { Job } from "@/types";

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const sourceLabel = job.source === "jobinja" ? "Jobinja" : "Jobvision";
  const sourceColor = job.source === "jobinja" ? "bg-blue-900 text-blue-300" : "bg-purple-900 text-purple-300";

  return (
    <div className="p-4 border border-gray-800 rounded-2xl hover:bg-gray-900/50 transition-colors h-full flex flex-col">
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-medium text-sm leading-relaxed">{job.title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${sourceColor}`}>
            {sourceLabel}
          </span>
        </div>
        
        <p className="text-gray-400 text-sm">{job.company}</p>
        
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">{job.location}</span>
          {job.isRemote && (
            <span className="text-xs px-2 py-0.5 rounded bg-green-900 text-green-300">
              Remote
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {job.workType && (
            <>
              <span>{job.workType}</span>
              <span>•</span>
            </>
          )}
          {job.seniority && (
            <>
              <span>{job.seniority}</span>
              <span>•</span>
            </>
          )}
          <span>{job.date}</span>
        </div>
      </div>
      
      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 text-xs text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg inline-block w-fit transition-colors"
      >
        View Job
      </a>
    </div>
  );
}