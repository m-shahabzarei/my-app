import { useState, useEffect, useCallback, useMemo } from "react";
import { Message } from "@/types";

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  getMessagesByApp: (app: string) => Promise<Message[]>;
  getRecentMessages: (app?: string, limit?: number) => Promise<Message[]>;
  searchMessages: (query: string) => Promise<Message[]>;
  filterByDate: (date: string) => Promise<Message[]>;
  refetch: () => void;
}

export function useMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (params?: URLSearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const url = params ? `/api/messages?${params.toString()}` : "/api/messages";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const getMessagesByApp = useCallback(async (app: string): Promise<Message[]> => {
    try {
      const params = new URLSearchParams({ app });
      const response = await fetch(`/api/messages?${params}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);

  const getRecentMessages = useCallback(async (app?: string, limit = 10): Promise<Message[]> => {
    try {
      const params = new URLSearchParams();
      if (app) params.set("app", app);
      params.set("limit", limit.toString());
      const response = await fetch(`/api/messages?${params}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);

  const searchMessages = useCallback(async (query: string): Promise<Message[]> => {
    try {
      const params = new URLSearchParams({ search: query });
      const response = await fetch(`/api/messages?${params}`);
      if (!response.ok) throw new Error("Failed to search messages");
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);

  const filterByDate = useCallback(async (date: string): Promise<Message[]> => {
    try {
      const params = new URLSearchParams({ date });
      const response = await fetch(`/api/messages?${params}`);
      if (!response.ok) throw new Error("Failed to filter messages");
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);

  const refetch = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  return useMemo(
    () => ({
      messages,
      loading,
      error,
      getMessagesByApp,
      getRecentMessages,
      searchMessages,
      filterByDate,
      refetch,
    }),
    [messages, loading, error, getMessagesByApp, getRecentMessages, searchMessages, filterByDate, refetch]
  );
}