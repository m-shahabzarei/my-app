"use client";

import { useEffect } from "react";
import Card from "@/components/Card";
import { messengers } from "@/lib/mockData";
import { useMessengerStore } from "@/store/useMessengerStore";

export default function MessengersPage() {
  const { activeMessengers, loadFromStorage, toggleMessenger } = useMessengerStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">Messengers</h1>

      <div className="flex flex-col gap-3">
        {messengers.map((messenger) => {
          const isActive = activeMessengers.includes(messenger.id);
          return (
            <Card key={messenger.id}>
              <div className="flex justify-between items-center">
                <span className="text-white text-sm font-medium">{messenger.name}</span>
                <button
                  onClick={() => toggleMessenger(messenger.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isActive ? "bg-white" : "bg-gray-800"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                      isActive ? "left-7 bg-black" : "left-1 bg-gray-400"
                    }`}
                  />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}