"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CalendarClock, ListChecks } from "lucide-react";
import { addDays, todayKey } from "@/lib/planning";
import { usePlanningTasks } from "@/hooks/planning/usePlanningTasks";
import { usePlanningStore } from "@/store/planning/usePlanningStore";
import type { PlanningTask, PlanningTaskDraft } from "@/types/planning";
import CalendarSidebar from "./CalendarSidebar";
import DaySelector from "./DaySelector";
import PlannerHeader from "./PlannerHeader";
import TaskCard from "./TaskCard";
import TaskDialog from "./TaskDialog";
import TimelineView from "./TimelineView";

export default function PlannerLayout() {
  const { tasks, selectedDate, selectedTasks, planningDays, selectedStats } = usePlanningTasks();
  const hydrate = usePlanningStore((state) => state.hydrate);
  const setSelectedDate = usePlanningStore((state) => state.setSelectedDate);
  const addTask = usePlanningStore((state) => state.addTask);
  const updateTask = usePlanningStore((state) => state.updateTask);
  const deleteTask = usePlanningStore((state) => state.deleteTask);
  const toggleTaskCompleted = usePlanningStore((state) => state.toggleTaskCompleted);
  const scheduleTask = usePlanningStore((state) => state.scheduleTask);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlanningTask | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const openCreateDialog = useCallback(() => {
    setEditingTask(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((task: PlanningTask) => {
    setEditingTask(task);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingTask(null);
  }, []);

  function handleSaveTask(draft: PlanningTaskDraft) {
    if (editingTask) {
      updateTask(editingTask.id, draft);
      return;
    }

    addTask(draft);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_28rem),#050505] text-white">
      <div className="mx-auto flex w-full max-w-420 flex-col gap-5 p-4 sm:p-6 xl:p-8">
        <PlannerHeader
          selectedDate={selectedDate}
          totalTasks={selectedStats.total}
          completedTasks={selectedStats.completed}
          timedTasks={selectedStats.timed}
          onAddTask={openCreateDialog}
          onPreviousDay={() => setSelectedDate(addDays(selectedDate, -1))}
          onNextDay={() => setSelectedDate(addDays(selectedDate, 1))}
          onToday={() => setSelectedDate(todayKey())}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="min-w-0 space-y-5">
            <DaySelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />

            <div className="grid gap-5 2xl:grid-cols-[380px_minmax(0,1fr)]">
              <section className="rounded-3xl border border-white/10 bg-white/3 p-4 shadow-2xl shadow-black/20">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <ListChecks className="h-4 w-4" />
                      Daily tasks
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">Create, edit, complete, or drag into the timeline.</p>
                  </div>
                  <button
                    type="button"
                    onClick={openCreateDialog}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {selectedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={toggleTaskCompleted}
                        onEdit={openEditDialog}
                        onDelete={deleteTask}
                      />
                    ))}
                  </AnimatePresence>

                  {selectedTasks.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-center">
                      <CalendarClock className="mx-auto h-6 w-6 text-neutral-600" />
                      <p className="mt-3 text-sm font-medium text-neutral-300">No tasks planned</p>
                      <p className="mt-1 text-sm text-neutral-500">Start with one simple task for this day.</p>
                      <button
                        type="button"
                        onClick={openCreateDialog}
                        className="mt-4 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
                      >
                        Create task
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <TimelineView
                tasks={selectedTasks}
                onScheduleTask={scheduleTask}
                onEditTask={openEditDialog}
                onDeleteTask={deleteTask}
              />
            </div>
          </main>

          <CalendarSidebar
            selectedDate={selectedDate}
            tasks={tasks}
            planningDays={planningDays}
            onSelectDate={setSelectedDate}
          />
        </div>
      </div>

      <TaskDialog
        open={dialogOpen}
        selectedDate={selectedDate}
        task={editingTask}
        onClose={closeDialog}
        onSave={handleSaveTask}
        onDelete={deleteTask}
      />
    </div>
  );
}
