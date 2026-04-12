"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import MessageCard from "@/components/MessageCard";
import EmptyState from "@/components/EmptyState";
import { MessageCardSkeleton } from "@/components/Skeleton";
import { useMessages } from "@/hooks/useMessages";
import { useMessengerStore } from "@/store/useMessengerStore";
import { Message } from "@/types";
import { messengers } from "@/lib/mockData";

export default function MessagesPage() {
  const { loading, error, getRecentMessages } = useMessages();
  const { activeMessengers, loadFromStorage } = useMessengerStore();
  const [messengerMessages, setMessengerMessages] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    async function fetchMessages() {
      const result: Record<string, Message[]> = {};
      for (const appId of activeMessengers) {
        const messages = await getRecentMessages(appId, 10);
        result[appId] = messages;
      }
      setMessengerMessages(result);
    }
    fetchMessages();
  }, [activeMessengers, getRecentMessages]);

  const activeMessengerList = messengers.filter((m) => activeMessengers.includes(m.id));

  if (error) {
    return <EmptyState title="Error" message={error} />;
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">My Messages</h1>

      {loading ? (
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <MessageCardSkeleton />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <MessageCardSkeleton key={j} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : activeMessengerList.length === 0 ? (
        <EmptyState
          title="No active messengers"
          message="Enable messengers from the Messengers page to see their messages here."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {activeMessengerList.map((messenger) => {
            const messages = messengerMessages[messenger.id] || [];
            return (
              <section key={messenger.id}>
                <Link href={`/messages/${messenger.id}`}>
                  <h2 className="text-lg font-semibold text-white mb-3 hover:text-gray-300 transition-colors">
                    {messenger.name}
                  </h2>
                </Link>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <Link key={msg.id} href={`/messages/${messenger.id}`}>
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
                      <p className="text-gray-500 text-sm">No messages</p>
                    </Card>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}