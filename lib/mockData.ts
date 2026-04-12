import { Message, Task, Messenger } from "@/types";

export const messengers: Messenger[] = [
  { id: "telegram", name: "Telegram", enabled: true },
  { id: "gmail", name: "Gmail", enabled: true },
  { id: "eitaa", name: "Eitaa", enabled: false },
  { id: "mezito", name: "Mezito", enabled: false },
];

export const telegramMessages: Message[] = [
  {
    id: "t1",
    app: "telegram",
    sender: "Alice Johnson",
    text: "Hey! Are you coming to the meeting today?",
    date: "2026-04-11 09:30",
  },
  {
    id: "t2",
    app: "telegram",
    sender: "Bob Smith",
    text: "I've sent you the project files. Please check when you can.",
    date: "2026-04-11 08:15",
  },
  {
    id: "t3",
    app: "telegram",
    sender: "Team Lead",
    text: "Reminder: Sprint review at 2pm today. Please prepare your updates.",
    date: "2026-04-10 16:45",
  },
  {
    id: "t4",
    app: "telegram",
    sender: "Alice Johnson",
    text: "Thanks for the help with the code yesterday!",
    date: "2026-04-10 14:20",
  },
  {
    id: "t5",
    app: "telegram",
    sender: "Charlie Brown",
    text: "Can you review my PR when you get a chance?",
    date: "2026-04-10 11:00",
  },
  {
    id: "t6",
    app: "telegram",
    sender: "Bob Smith",
    text: "The deployment is complete. All tests passing.",
    date: "2026-04-09 18:30",
  },
  {
    id: "t7",
    app: "telegram",
    sender: "Diana Prince",
    text: "Let's schedule a call to discuss the new feature requirements.",
    date: "2026-04-09 15:00",
  },
  {
    id: "t8",
    app: "telegram",
    sender: "Team Lead",
    text: "Great work on the release! The client is very happy.",
    date: "2026-04-08 10:00",
  },
  {
    id: "t9",
    app: "telegram",
    sender: "Eve Davis",
    text: "I've updated the documentation. Let me know if you have questions.",
    date: "2026-04-08 09:30",
  },
  {
    id: "t10",
    app: "telegram",
    sender: "Frank Miller",
    text: "Coffee break? Need to chat about something.",
    date: "2026-04-07 14:00",
  },
  {
    id: "t11",
    app: "telegram",
    sender: "Grace Lee",
    text: "The API is working perfectly now. Thanks for the fix!",
    date: "2026-04-07 11:15",
  },
  {
    id: "t12",
    app: "telegram",
    sender: "Henry Wilson",
    text: "Don't forget to submit your timesheet.",
    date: "2026-04-06 16:00",
  },
];

export const gmailMessages: Message[] = [
  {
    id: "g1",
    app: "gmail",
    sender: "HR Department",
    text: "Your annual leave request has been approved.",
    date: "2026-04-11 10:00",
  },
  {
    id: "g2",
    app: "gmail",
    sender: "Newsletter",
    text: "Weekly Tech Digest: New AI tools, framework updates, and developer tips.",
    date: "2026-04-10 08:00",
  },
  {
    id: "g3",
    app: "gmail",
    sender: "Project Manager",
    text: "Project Status Update: Phase 1 is complete. Starting Phase 2 next week.",
    date: "2026-04-09 14:30",
  },
  {
    id: "g4",
    app: "gmail",
    sender: "IT Support",
    text: "Your password will expire in 7 days. Please update it soon.",
    date: "2026-04-09 09:00",
  },
  {
    id: "g5",
    app: "gmail",
    sender: "Client Services",
    text: "Thank you for your feedback. We've forwarded your suggestions to the team.",
    date: "2026-04-08 15:00",
  },
  {
    id: "g6",
    app: "gmail",
    sender: "HR Department",
    text: "Team building event next Friday. Please confirm your attendance.",
    date: "2026-04-08 10:00",
  },
  {
    id: "g7",
    app: "gmail",
    sender: "Newsletter",
    text: "Productivity Weekly: 5 tools to boost your workflow.",
    date: "2026-04-07 08:00",
  },
  {
    id: "g8",
    app: "gmail",
    sender: "Security Team",
    text: "Action Required: Enable two-factor authentication on your account.",
    date: "2026-04-06 11:00",
  },
  {
    id: "g9",
    app: "gmail",
    sender: "Marketing Team",
    text: "New blog post published. Check it out!",
    date: "2026-04-05 16:00",
  },
  {
    id: "g10",
    app: "gmail",
    sender: "Finance",
    text: "Your expense report has been processed. Refund will be deposited soon.",
    date: "2026-04-04 13:00",
  },
];

export const eitaaMessages: Message[] = [
  {
    id: "e1",
    app: "eitaa",
    sender: "Family Group",
    text: "Mom is asking when you're visiting this weekend.",
    date: "2026-04-11 08:00",
  },
  {
    id: "e2",
    app: "eitaa",
    sender: "Sara",
    text: "Did you see the photos from yesterday?",
    date: "2026-04-10 20:30",
  },
  {
    id: "e3",
    app: "eitaa",
    sender: "Family Group",
    text: "Don't forget dinner on Sunday at 7pm!",
    date: "2026-04-09 18:00",
  },
  {
    id: "e4",
    app: "eitaa",
    sender: "Reza",
    text: "Let's meet at the cafe tomorrow.",
    date: "2026-04-08 14:00",
  },
  {
    id: "e5",
    app: "eitaa",
    sender: "Family Group",
    text: "Happy birthday wishes from everyone!",
    date: "2026-04-07 12:00",
  },
];

export const mezitoMessages: Message[] = [
  {
    id: "m1",
    app: "mezito",
    sender: "Work Group",
    text: "Anyone up for lunch today?",
    date: "2026-04-11 12:00",
  },
  {
    id: "m2",
    app: "mezito",
    sender: "Anna",
    text: "Hey! How was your weekend?",
    date: "2026-04-10 09:00",
  },
  {
    id: "m3",
    app: "mezito",
    sender: "Work Group",
    text: "The new coffee machine is here!",
    date: "2026-04-09 08:30",
  },
  {
    id: "m4",
    app: "mezito",
    sender: "Mike",
    text: "Game night this Friday. You're in, right?",
    date: "2026-04-08 19:00",
  },
  {
    id: "m5",
    app: "mezito",
    sender: "Anna",
    text: "Check out this funny video!",
    date: "2026-04-07 21:00",
  },
];

export const planningTasks: Task[] = [
  {
    id: "pt1",
    title: "Complete project documentation",
    description: "Write comprehensive documentation for the new feature module.",
    category: "Work",
    tags: ["documentation", "urgent"],
    date: "2026-04-11",
    time: "10:00",
    checklist: [
      { id: "pt1c1", text: "Write API documentation", done: true },
      { id: "pt1c2", text: "Add code examples", done: true },
      { id: "pt1c3", text: "Create user guide", done: false },
    ],
    done: false,
  },
  {
    id: "pt2",
    title: "Team meeting preparation",
    description: "Prepare slides for the weekly team sync.",
    category: "Meeting",
    tags: ["meeting", "weekly"],
    date: "2026-04-11",
    time: "14:00",
    checklist: [],
    done: false,
  },
  {
    id: "pt3",
    title: "Code review",
    description: "Review PRs from team members for the sprint.",
    category: "Work",
    tags: ["code-review", "priority"],
    date: "2026-04-12",
    checklist: [
      { id: "pt3c1", text: "Review Alice's PR", done: false },
      { id: "pt3c2", text: "Review Bob's PR", done: false },
    ],
    done: false,
  },
  {
    id: "pt4",
    title: "Database optimization",
    description: "Optimize slow queries identified in the performance report.",
    category: "Work",
    tags: ["database", "performance"],
    date: "2026-04-13",
    checklist: [],
    done: false,
  },
  {
    id: "pt5",
    title: "Client presentation",
    description: "Prepare and deliver the quarterly presentation to the client.",
    category: "Presentation",
    tags: ["client", "important"],
    date: "2026-04-15",
    checklist: [
      { id: "pt5c1", text: "Create slides", done: false },
      { id: "pt5c2", text: "Gather metrics", done: false },
      { id: "pt5c3", text: "Rehearse presentation", done: false },
    ],
    done: false,
  },
];

export const learningTasks: Task[] = [
  {
    id: "lt1",
    title: "TypeScript Advanced Patterns",
    description: "Learn advanced TypeScript patterns including generics and conditional types.",
    category: "Programming",
    tags: ["typescript", "learning"],
    date: "2026-04-11",
    checklist: [
      { id: "lt1c1", text: "Watch video course", done: true },
      { id: "lt1c2", text: "Practice generics", done: false },
      { id: "lt1c3", text: "Complete exercises", done: false },
    ],
    done: false,
  },
  {
    id: "lt2",
    title: "Next.js App Router",
    description: "Complete the Next.js App Router tutorial.",
    category: "Framework",
    tags: ["nextjs", "tutorial"],
    date: "2026-04-12",
    checklist: [
      { id: "lt2c1", text: "Read docs", done: false },
      { id: "lt2c2", text: "Build sample app", done: false },
    ],
    done: false,
  },
  {
    id: "lt3",
    title: "System Design Basics",
    description: "Study system design fundamentals and patterns.",
    category: "Architecture",
    tags: ["system-design", "fundamentals"],
    date: "2026-04-13",
    checklist: [],
    done: false,
  },
  {
    id: "lt4",
    title: "Tailwind CSS Deep Dive",
    description: "Master Tailwind CSS configuration and customization.",
    category: "Styling",
    tags: ["tailwind", "css"],
    date: "2026-04-14",
    checklist: [
      { id: "lt4c1", text: "Custom theme", done: false },
      { id: "lt4c2", text: "Create components", done: false },
    ],
    done: false,
  },
  {
    id: "lt5",
    title: "Testing Best Practices",
    description: "Learn modern testing approaches with Vitest and React Testing Library.",
    category: "Testing",
    tags: ["testing", "vitest"],
    date: "2026-04-15",
    checklist: [],
    done: false,
  },
];

export function getMessagesByApp(app: string): Message[] {
  switch (app) {
    case "telegram":
      return telegramMessages;
    case "gmail":
      return gmailMessages;
    case "eitaa":
      return eitaaMessages;
    case "mezito":
      return mezitoMessages;
    default:
      return [];
  }
}

export function getRecentMessages(): Message[] {
  return [
    ...telegramMessages.slice(0, 3),
    ...gmailMessages.slice(0, 2),
  ].sort((a, b) => b.date.localeCompare(a.date));
}