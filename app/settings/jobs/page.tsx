"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import SourceToggle from "@/components/SourceToggle";
import { useJobSourceStore } from "@/store/useJobSourceStore";
import { JobSource } from "@/types";

const sources: { id: JobSource; name: string }[] = [
  { id: "jobinja", name: "Jobinja" },
  { id: "jobvision", name: "Jobvision" },
];

export default function JobSettingsPage() {
  const { activeSources, loadFromStorage, toggleSource } = useJobSourceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-6">Job Sources</h1>
        <Card>
          <p className="text-gray-500 text-sm">Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">Job Sources</h1>

      <div className="flex flex-col gap-3">
        {sources.map((source) => (
          <SourceToggle
            key={source.id}
            label={source.name}
            isActive={activeSources.includes(source.id)}
            onToggle={() => toggleSource(source.id)}
          />
        ))}
      </div>

      <p className="text-gray-500 text-sm mt-4">
        Toggle sources on/off to control which job listings appear on the Jobs page.
      </p>
    </div>
  );
}