import { NextResponse } from "next/server";
import { Message } from "@/types";

const senders: Record<string, string[]> = {
  telegram: ["Alice Johnson", "Bob Smith", "Team Lead", "Charlie Brown", "Diana Prince", "Eve Davis", "Frank Miller", "Grace Lee", "Henry Wilson"],
  gmail: ["HR Department", "Newsletter", "Project Manager", "IT Support", "Client Services", "Marketing Team", "Security Team", "Finance", "Sales Team"],
  eitaa: ["Family Group", "Sara", "Reza", "Mom", "Dad", "Brother", "Sister", "Cousin", "Aunt"],
  mezito: ["Work Group", "Anna", "Mike", "John", "Emily", "David", "Lisa", "Tom", "Sarah"],
};

const messages: Record<string, string[]> = {
  telegram: [
    "Hey! Are you coming to the meeting today?",
    "I've sent you the project files. Please check when you can.",
    "Reminder: Sprint review at 2pm today. Please prepare your updates.",
    "Thanks for the help with the code yesterday!",
    "Can you review my PR when you get a chance?",
    "The deployment is complete. All tests passing.",
    "Let's schedule a call to discuss the new feature requirements.",
    "Great work on the release! The client is very happy.",
    "I've updated the documentation. Let me know if you have questions.",
    "Coffee break? Need to chat about something.",
    "The API is working perfectly now. Thanks for the fix!",
    "Don't forget to submit your timesheet.",
    "Can you help me with this bug?",
    "Meeting notes are ready in the shared folder.",
    "Happy Friday! Any plans for the weekend?",
  ],
  gmail: [
    "Your annual leave request has been approved.",
    "Weekly Tech Digest: New AI tools, framework updates, and developer tips.",
    "Project Status Update: Phase 1 is complete. Starting Phase 2 next week.",
    "Your password will expire in 7 days. Please update it soon.",
    "Thank you for your feedback. We've forwarded your suggestions to the team.",
    "Team building event next Friday. Please confirm your attendance.",
    "Productivity Weekly: 5 tools to boost your workflow.",
    "Action Required: Enable two-factor authentication on your account.",
    "New blog post published. Check it out!",
    "Your expense report has been processed. Refund will be deposited soon.",
    "Invoice attached. Please review and confirm.",
    "Quarterly report is ready for review.",
    "System maintenance scheduled for this weekend.",
    "Welcome to the team! Here's your onboarding guide.",
    "Reminder: Team standup in 15 minutes.",
  ],
  eitaa: [
    "Mom is asking when you're visiting this weekend.",
    "Did you see the photos from yesterday?",
    "Don't forget dinner on Sunday at 7pm!",
    "Let's meet at the cafe tomorrow.",
    "Happy birthday wishes from everyone!",
    "The food was amazing! Thanks for the recommendation.",
    "Can you bring the books when you come?",
    "Traffic is bad, I'll be 20 minutes late.",
    "Love you! Talk soon.",
    "Did you finish the homework?",
    "The weather is great today!",
    "Don't forget to call grandma.",
    "I made your favorite dish!",
    "See you tomorrow!",
    "祝你今天愉快!",
  ],
  mezito: [
    "Anyone up for lunch today?",
    "Hey! How was your weekend?",
    "The new coffee machine is here!",
    "Game night this Friday. You're in, right?",
    "Check out this funny video!",
    "Just finished the workout. Feeling great!",
    "Did you see the match last night?",
    "Let's go for a run tomorrow morning.",
    "Thanks for the dinner suggestion!",
    "The concert was amazing!",
    "Traffic is terrible today...",
    "Just got home. Exhausted!",
    "Good luck with your presentation!",
    "See you at the party!",
    "Don't forget to bring the charger.",
  ],
};

function generateMessages(): Message[] {
  const result: Message[] = [];
  const now = new Date();
  
  const apps = Object.keys(senders);
  
  apps.forEach((app) => {
    const appSenders = senders[app];
    const appMessages = messages[app];
    
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      const hoursAgo = Math.floor(Math.random() * 24);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(date.getHours() - hoursAgo);
      
      const dateStr = date.toISOString().replace("T", " ").substring(0, 16);
      
      result.push({
        id: `${app}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        app,
        sender: appSenders[Math.floor(Math.random() * appSenders.length)],
        text: appMessages[Math.floor(Math.random() * appMessages.length)],
        date: dateStr,
      });
    }
  });
  
  return result.sort((a, b) => b.date.localeCompare(a.date));
}

const allMessages = generateMessages();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const app = searchParams.get("app");
  const limit = searchParams.get("limit");
  const search = searchParams.get("search");
  const date = searchParams.get("date");
  
  let filtered = [...allMessages];
  
  if (app) {
    filtered = filtered.filter((m) => m.app === app);
  }
  
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.sender.toLowerCase().includes(query) ||
        m.text.toLowerCase().includes(query)
    );
  }
  
  if (date) {
    filtered = filtered.filter((m) => m.date.startsWith(date));
  }
  
  if (limit) {
    filtered = filtered.slice(0, parseInt(limit));
  }
  
  return NextResponse.json(filtered);
}