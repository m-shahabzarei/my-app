"use client";

import RoadmapShell from "@/components/roadmap/RoadmapShell";

interface RoadmapClientEntryProps {
  storageScope?: string | null;
}

export default function RoadmapClientEntry({ storageScope }: RoadmapClientEntryProps) {
  return <RoadmapShell storageScope={storageScope} />;
}
