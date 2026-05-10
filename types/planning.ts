export const PLANNING_COLORS = ["slate", "blue", "violet", "emerald", "amber", "rose"] as const;

export type PlanningTaskColor = (typeof PLANNING_COLORS)[number];

export interface PlanningTask {
  id: string;
  title: string;
  description?: string;
  date: string;
  completed: boolean;
  startTime?: string;
  endTime?: string;
  color: PlanningTaskColor;
  createdAt: string;
  updatedAt: string;
}

export interface PlanningTaskDraft {
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  color: PlanningTaskColor;
}

export interface PlanningDaySummary {
  date: string;
  total: number;
  completed: number;
}
