"use client";

import { useEffect, useState, useMemo } from "react";
import { notFound } from "next/navigation";
import Card from "@/components/Card";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import { MessageCardSkeleton } from "@/components/Skeleton";
import { useMessages } from "@/hooks/useMessages";
import { useMessengerStore } from "@/store/useMessengerStore";
import { messengers } from "@/lib/mockData";
import { Message } from "@/types";

interface PageProps {
  params: Promise<{ app: string }>;
}

interface MessageGroup {
  label: string;
  messages: Message[];
}

export default async function MessageDetailPage({ params }: PageProps) {
  const { app } = await params;
  const messenger = messengers.find((m) => m.id === app);
  
  if (!messenger) {
    notFound();
  }

  return <MessageDetailContent app={app} messengerName={messenger.name} />;
}

function MessageDetailContent({ app, messengerName }: { app: string; messengerName: string }) {
  const { messages: allMessages, loading, error, searchMessages, filterByDate } = useMessages();
  const { activeMessengers, loadFromStorage } = useMessengerStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    const filtered = allMessages.filter((m) => m.app === app);
    setFilteredMessages(filtered);
  }, [allMessages, app]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query) {
      const results = await searchMessages(query);
      setFilteredMessages(results.filter((m) => m.app === app));
    } else {
      const filtered = allMessages.filter((m) => m.app === app);
      setFilteredMessages(dateFilter ? filtered.filter((m) => m.date.startsWith(dateFilter)) : filtered);
    }
  };

  const handleDateFilter = async (date: string) => {
    setDateFilter(date);
    if (date) {
      const results = await filterByDate(date);
      setFilteredMessages(results.filter((m) => m.app === app));
    } else {
      const filtered = allMessages.filter((m) => m.app === app);
      setFilteredMessages(searchQuery ? filtered.filter((m) => 
        m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.text.toLowerCase().includes(searchQuery.toLowerCase())
      ) : filtered);
    }
  };

  const groupedMessages = useMemo((): MessageGroup[] => {
    const groups: Record<string, Message[]> = {
      today: [],
      yesterday: [],
      older: [],
    };

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    filteredMessages.forEach((msg) => {
      const msgDate = msg.date.split(" ")[0];
      if (msgDate === today) {
        groups.today.push(msg);
      } else if (msgDate === yesterday) {
        groups.yesterday.push(msg);
      } else {
        groups.older.push(msg);
      }
    });

    const result: MessageGroup[] = [];
    if (groups.today.length > 0) result.push({ label: "Today", messages: groups.today });
    if (groups.yesterday.length > 0) result.push({ label: "Yesterday", messages: groups.yesterday });
    if (groups.older.length > 0) result.push({ label: "Older", messages: groups.older });

    return result;
  }, [filteredMessages]);

  if (!activeMessengers.includes(app)) {
    return (
      <div className="p-6 max-w-4xl">
        <EmptyState
          title="Messenger not active"
          message="Enable this messenger from the Messengers page to view its messages."
        />
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Error" message={error} />;
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">{messengerName}</h1>

      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-white placeholder-gray-600"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => handleDateFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-white"
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <MessageCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredMessages.length === 0 ? (
        <EmptyState
          title="No messages found"
          message={searchQuery || dateFilter ? "Try adjusting your search or filters." : "No messages in this app yet."}
        />
      ) : (
        <div className="space-y-6">
          {groupedMessages.map((group) => (
            <section key={group.label}>
              <h2 className="text-sm font-medium text-gray-500 mb-3">{group.label}</h2>
              <div className="flex flex-col gap-3">
                {group.messages.map((msg) => (
                  <Card key={msg.id}>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <p className="text-white font-medium">{msg.sender}</p>
                        <span className="text-xs text-gray-500">{msg.date}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{msg.text}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}