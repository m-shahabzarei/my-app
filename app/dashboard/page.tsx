"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { MessageCardSkeleton } from "@/components/Skeleton";
import { comparePlanningTasks, formatTimeRange, todayKey } from "@/lib/planning";
import { usePlanningStore } from "@/store/planning/usePlanningStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useMessengerStore } from "@/store/useMessengerStore";
import { useMessages } from "@/hooks/useMessages";

interface MessageCardProps {
  id: string;
  app: string;
  sender: string;
  text: string;
  date: string;
}

export default function DashboardPage() {
  const planningTasks = usePlanningStore((state) => state.tasks);
  const hydratePlanning = usePlanningStore((state) => state.hydrate);
  const { learningTasks, loadFromStorage: loadLearningTasks } = useTaskStore();
  const { activeMessengers, loadFromStorage: loadMessengers } = useMessengerStore();
  const { getRecentMessages, loading: loadingMessages } = useMessages();
  const [recentMessages, setRecentMessages] = useState<MessageCardProps[]>([]);

  const today = todayKey();

  useEffect(() => {
    hydratePlanning();
    loadLearningTasks();
    loadMessengers();
  }, [hydratePlanning, loadLearningTasks, loadMessengers]);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecent() {
      const allMessages: MessageCardProps[] = [];
      for (const appId of activeMessengers.slice(0, 3)) {
        const msgs = await getRecentMessages(appId, 3);
        allMessages.push(...msgs);
      }
      allMessages.sort((a, b) => b.date.localeCompare(a.date));
      if (!cancelled) setRecentMessages(allMessages.slice(0, 6));
    }

    fetchRecent();
    return () => {
      cancelled = true;
    };
  }, [activeMessengers, getRecentMessages]);

  const todayTasks = planningTasks.filter((task) => task.date === today).sort(comparePlanningTasks);
  const todayLearning = learningTasks.filter((task) => task.date === today);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <div className="grid gap-8">
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Recent Messages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingMessages ? (
              [1, 2, 3, 4].map((i) => <MessageCardSkeleton key={i} />)
            ) : recentMessages.length > 0 ? (
              recentMessages.map((msg) => (
                <Link key={msg.id} href={`/messages/${msg.app}`}>
                  <Card className="hover:bg-gray-900/50 transition-colors h-full">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500 uppercase">{msg.app}</span>
                      <p className="text-white font-medium text-sm">{msg.sender}</p>
                      <p className="text-gray-400 text-sm truncate">{msg.text}</p>
                      <p className="text-xs text-gray-600 mt-1">{msg.date}</p>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card>
                <p className="text-gray-500 text-sm">No recent messages</p>
              </Card>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Today Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <Link key={task.id} href="/planning">
                  <Card className="hover:bg-gray-900/50 transition-colors h-full">
                    <div className="flex flex-col gap-1">
                      <p className={`text-sm font-medium ${task.completed ? "text-gray-500 line-through" : "text-white"}`}>
                        {task.title}
                      </p>
                      {task.description && <p className="text-gray-400 text-sm">{task.description}</p>}
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs text-gray-500">{formatTimeRange(task.startTime, task.endTime)}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card>
                <p className="text-gray-500 text-sm">No tasks for today</p>
              </Card>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Today Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayLearning.length > 0 ? (
              todayLearning.map((task) => (
                <Link key={task.id} href="/learning">
                  <Card className="hover:bg-gray-900/50 transition-colors h-full">
                    <div className="flex flex-col gap-1">
                      <p className={`text-sm font-medium ${task.done ? "text-gray-500 line-through" : "text-white"}`}>
                        {task.title}
                      </p>
                      <p className="text-gray-400 text-sm">{task.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs text-gray-500">{task.category}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card>
                <p className="text-gray-500 text-sm">No learning items for today</p>
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
