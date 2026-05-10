import type { Metadata } from "next";
import RoadmapClientEntry from "@/components/roadmap/RoadmapClientEntry";

export const metadata: Metadata = {
  title: "Road Map | Productivity App",
  description: "Create, connect, and manage visual product roadmap flows.",
};

export default function RoadmapPage() {
  return <RoadmapClientEntry storageScope={null} />;
}
