export interface Message {
  id: string;
  app: string;
  sender: string;
  text: string;
  date: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
  time?: string;
  checklist: ChecklistItem[];
  done: boolean;
}

export interface Messenger {
  id: string;
  name: string;
  enabled: boolean;
}

export type JobSource = "jobinja" | "jobvision";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  source: JobSource;
  date: string;
  url: string;
  isRemote?: boolean;
  workType?: string;
  seniority?: string;
}