"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import TaskModal from "@/components/TaskModal";
import Checkbox from "@/components/Checkbox";
import { useTaskStore } from "@/store/useTaskStore";
import { Task } from "@/types";

export default function LearningPage() {
  const { learningTasks, loadFromStorage, addTask, updateTask, deleteTask, toggleTaskDone } = useTaskStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleAdd = (task: Omit<Task, "id" | "done">) => {
    addTask(task);
  };

  const handleEdit = (task: Omit<Task, "id" | "done">) => {
    if (editingTask) {
      updateTask(editingTask.id, task);
    }
  };

  const handleDelete = () => {
    if (editingTask) {
      deleteTask(editingTask.id);
      setModalOpen(false);
      setEditingTask(null);
    }
  };

  const openAddModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Learning</h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-white text-black rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
        >
          + Add New
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {learningTasks.map((task) => (
          <Card key={task.id} className="hover:bg-gray-900/50 transition-colors cursor-pointer">
            <div onClick={() => openEditModal(task)}>
              <div className="flex items-start gap-3">
                <div onClick={(e) => { e.stopPropagation(); toggleTaskDone(task.id); }}>
                  <Checkbox checked={task.done} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.done ? "text-gray-500 line-through" : "text-white"}`}>
                    {task.title}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-gray-500">{task.category}</span>
                    <span className="text-xs text-gray-500">• {task.date}</span>
                    {task.tags.map((tag) => (
                      <span key={tag} className="text-xs text-gray-600 bg-gray-900 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {task.checklist.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.checklist.slice(0, 3).map((item) => (
                        <span
                          key={item.id}
                          className={`text-xs px-2 py-0.5 rounded ${
                            item.done ? "bg-gray-800 text-gray-500 line-through" : "bg-gray-900 text-gray-400"
                          }`}
                        >
                          {item.text}
                        </span>
                      ))}
                      {task.checklist.length > 3 && (
                        <span className="text-xs text-gray-500">+{task.checklist.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {learningTasks.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No learning items yet. Click Add New to create one.</p>
        )}
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={editingTask ? handleEdit : handleAdd}
        onDelete={editingTask ? handleDelete : undefined}
        task={editingTask}
        title={editingTask ? "Edit Learning Item" : "Add New Learning Item"}
      />
    </div>
  );
}
