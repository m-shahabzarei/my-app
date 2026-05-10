import type { Metadata } from "next";
import PlannerLayout from "@/components/planning/PlannerLayout";

export const metadata: Metadata = {
  title: "Planning | Productivity App",
  description: "A lightweight daily planner with time blocking.",
};

export default function PlanningPage() {
  return <PlannerLayout />;
}
