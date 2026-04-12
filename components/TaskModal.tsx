"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import Checkbox from "./Checkbox";
import { Task, ChecklistItem } from "@/types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "done">) => void;
  onDelete?: () => void;
  task?: Task | null;
  title: string;
}

export default function TaskModal({ isOpen, onClose, onSave, onDelete, task, title }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    date: "",
    time: "",
  });
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        category: task.category,
        tags: task.tags.join(", "),
        date: task.date,
        time: task.time || "",
      });
      setChecklist([...task.checklist]);
    } else {
      setFormData({
        title: "",
        description: "",
        category: "",
        tags: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
      });
      setChecklist([]);
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    onSave({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: tagsArray,
      date: formData.date,
      time: formData.time || undefined,
      checklist,
    });
    onClose();
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist([
        ...checklist,
        { id: Date.now().toString(), text: newChecklistItem.trim(), done: false },
      ]);
      setNewChecklistItem("");
    }
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white resize-none"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Time (optional)</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Tags (comma separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
            placeholder="urgent, work, daily"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Checklist</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              placeholder="Add item..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChecklistItem())}
            />
            <button
              type="button"
              onClick={addChecklistItem}
              className="px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Checkbox checked={item.done} onChange={() => toggleChecklistItem(item.id)} />
                <span className={`text-sm flex-1 ${item.done ? "text-gray-500 line-through" : "text-gray-300"}`}>
                  {item.text}
                </span>
                <button
                  type="button"
                  onClick={() => removeChecklistItem(item.id)}
                  className="text-gray-500 hover:text-white text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-gray-200"
          >
            Save
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 border border-red-800 text-red-400 rounded-lg text-sm hover:bg-red-900/20"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}