"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Save, 
  ChevronRight,
  GitBranch,
  Bug,
  ListTodo,
  Settings as SettingsIcon,
  Filter,
  Layers,
  ChevronDown,
  Calendar
} from "lucide-react";
import { useToast } from "@/components/shared/Toast";

interface ProjectTask {
  id: string;
  title: string;
  description: string | null;
  version: string;
  category: string;
  percentage: number;
  status: string;
  order: number;
}

export default function ProcessPageClient() {
  const { success, error: toastError } = useToast();
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [filterVersion, setFilterVersion] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/process");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = () => {
    const newTask: ProjectTask = {
      id: "new-" + Date.now(),
      title: "New Item",
      description: "",
      version: filterVersion === "all" ? "1.0" : filterVersion,
      category: filterCategory === "all" ? "TASK" : filterCategory,
      percentage: 0,
      status: "PENDING",
      order: tasks.length,
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (id: string, updates: Partial<ProjectTask>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteTask = async (id: string) => {
    if (id.startsWith("new-")) {
      setTasks(tasks.filter(t => t.id !== id));
      return;
    }

    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const res = await fetch(`/api/admin/process/${id}`, { method: "DELETE" });
        if (res.ok) {
          setTasks(tasks.filter(t => t.id !== id));
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      for (const task of tasks) {
        const method = task.id.startsWith("new-") ? "POST" : "PUT";
        const url = task.id.startsWith("new-") ? "/api/admin/process" : `/api/admin/process/${task.id}`;
        
        await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        });
      }
      fetchTasks();
      success("All changes saved successfully!");
    } catch (error) {
      console.error(error);
      toastError("Failed to save some tasks.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const versionMatch = filterVersion === "all" || t.version === filterVersion;
    const categoryMatch = filterCategory === "all" || t.category === filterCategory;
    return versionMatch && categoryMatch;
  });

  const versions = ["1.0", "2.0", "3.0"]; // Predetermined versions or dynamic
  const categories = ["TASK", "BUG", "SECTION", "REQUIREMENT", "DESIGN"];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle2 className="text-green-500" size={20} />;
      case "PARTIAL": return <Clock className="text-amber-500" size={20} />;
      case "IN_PROGRESS": return <Clock className="text-blue-500" size={20} />;
      case "PENDING": return <Circle className="text-slate-300" size={20} />;
      default: return <AlertCircle className="text-red-500" size={20} />;
    }
  };

  return (
    <div className="admin-shell space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="admin-page-title">Development Process</h1>
          <p className="admin-page-subtitle">Roadmap & Version Control</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAddTask}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#f0f2f8] text-[#0f1523] rounded-lg text-[13px] font-medium hover:bg-slate-50 transition-all"
          >
            <Plus size={16} /> Add Task
          </button>
          <button 
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f1523] text-white rounded-lg text-[13px] font-medium hover:bg-black transition-all disabled:opacity-50"
          >
            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={16} />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-[10px] border border-[#f0f2f8]">
        <div className="flex items-center gap-2 text-[13px] font-bold text-[#0f1523] px-2 border-r border-[#f0f2f8] pr-4">
          <Filter size={16} className="text-[#8a9ab5]" /> Filters
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Version</span>
          <select 
            value={filterVersion}
            onChange={(e) => setFilterVersion(e.target.value)}
            className="bg-[#f8f9fb] border border-[#f0f2f8] rounded-md px-3 py-1.5 text-[13px] text-[#0f1523] outline-none cursor-pointer"
          >
            <option value="all">All</option>
            {versions.map(v => <option key={v} value={v}>V {v}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Type</span>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#f8f9fb] border border-[#f0f2f8] rounded-md px-3 py-1.5 text-[13px] text-[#0f1523] outline-none cursor-pointer"
          >
            <option value="all">All</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {filteredTasks.length === 0 && (
            <button 
              onClick={async () => {
                const res = await fetch("/api/admin/process/seed");
                if (res.ok) fetchTasks();
              }}
              className="text-[11px] font-medium text-[#c1000a] hover:underline"
            >
              Import Baseline Roadmap
            </button>
          )}
          <div className="px-3 py-1 bg-[#f8f9fb] rounded-full text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider border border-[#f0f2f8]">
            {filteredTasks.length} Items
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task, index) => (
          <div 
            key={task.id}
            className={`bg-white rounded-[10px] border border-[#f0f2f8] p-6 flex flex-col gap-6 transition-all ${task.status === 'COMPLETED' ? 'bg-[#f8f9fb]/50 opacity-80' : ''}`}
          >
            <div className="flex flex-col lg:flex-row items-start gap-6">
              <div className="flex items-center gap-4 w-full lg:w-auto shrink-0">
                <div className="w-10 h-10 bg-[#f8f9fb] rounded-lg flex items-center justify-center text-[13px] font-bold text-[#8a9ab5] border border-[#f0f2f8]">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <button 
                  onClick={() => {
                    const statuses = ["PENDING", "IN_PROGRESS", "PARTIAL", "COMPLETED"];
                    const nextStatus = statuses[(statuses.indexOf(task.status) + 1) % statuses.length];
                    handleUpdateTask(task.id, { 
                      status: nextStatus, 
                      percentage: nextStatus === 'COMPLETED' ? 100 : (nextStatus === 'PENDING' ? 0 : task.percentage) 
                    });
                  }}
                  className="transition-transform active:scale-95"
                >
                  {getStatusIcon(task.status)}
                </button>
              </div>

              <div className="flex-1 space-y-4 w-full min-w-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <input 
                    type="text"
                    value={task.title}
                    onChange={(e) => handleUpdateTask(task.id, { title: e.target.value })}
                    placeholder="Task Title"
                    className="flex-1 bg-transparent border-none outline-none font-bold text-[15px] text-[#0f1523] placeholder:text-[#8a9ab5] w-full"
                  />
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 bg-[#f8f9fb] px-3 py-1.5 rounded-lg border border-[#f0f2f8]">
                      <Layers size={14} className="text-[#8a9ab5]" />
                      <select 
                        value={task.version}
                        onChange={(e) => handleUpdateTask(task.id, { version: e.target.value })}
                        className="bg-transparent text-[11px] font-bold text-[#0f1523] uppercase tracking-wider outline-none cursor-pointer"
                      >
                        {versions.map(v => <option key={v} value={v}>V{v}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 bg-[#f8f9fb] px-3 py-1.5 rounded-lg border border-[#f0f2f8]">
                      <select 
                        value={task.category}
                        onChange={(e) => handleUpdateTask(task.id, { category: e.target.value })}
                        className="bg-transparent text-[11px] font-bold text-[#0f1523] uppercase tracking-wider outline-none cursor-pointer"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <textarea 
                  value={task.description || ""}
                  onChange={(e) => handleUpdateTask(task.id, { description: e.target.value })}
                  placeholder="Task description..."
                  className="w-full bg-[#f8f9fb] p-3 rounded-lg border border-[#f0f2f8] outline-none text-[13px] text-[#0f1523] focus:bg-white focus:border-[#0f1523] transition-all resize-none h-20"
                />

                <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
                  <div className="flex-1 w-full h-2 bg-[#f8f9fb] rounded-full overflow-hidden relative border border-[#f0f2f8]">
                    <div 
                      className={`h-full transition-all duration-700 ${
                        task.status === 'COMPLETED' ? 'bg-[#059669]' : 
                        task.percentage > 50 ? 'bg-[#2563eb]' : 
                        'bg-[#d97706]'
                      }`}
                      style={{ width: `${task.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-[#f8f9fb] px-3 py-1.5 rounded-lg border border-[#f0f2f8]">
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={task.percentage}
                      onChange={(e) => handleUpdateTask(task.id, { percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                      className="w-10 text-right font-bold text-[#0f1523] bg-transparent outline-none text-[13px]"
                    />
                    <span className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between items-end gap-4 h-full lg:min-h-[140px] w-full lg:w-auto">
                <div className="flex flex-col items-end gap-1">
                   <span className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider mb-1">Status</span>
                   <select 
                    value={task.status}
                    onChange={(e) => handleUpdateTask(task.id, { status: e.target.value, percentage: e.target.value === 'COMPLETED' ? 100 : task.percentage })}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider outline-none cursor-pointer border ${
                      task.status === 'COMPLETED' ? 'bg-[#10b981]/10 text-[#059669] border-[#10b981]/20' : 
                      task.status === 'PENDING' ? 'bg-[#f8f9fb] text-[#8a9ab5] border-[#f0f2f8]' :
                      task.status === 'PARTIAL' ? 'bg-[#f59e0b]/10 text-[#d97706] border-[#f59e0b]/20' :
                      'bg-[#3b82f6]/10 text-[#2563eb] border-[#3b82f6]/20'
                    }`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 text-[#8a9ab5] hover:text-[#c1000a] hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                  title="Remove Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredTasks.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-white rounded-[10px] border border-dashed border-[#f0f2f8]">
            <div className="w-16 h-16 bg-[#f8f9fb] text-[#8a9ab5] rounded-full flex items-center justify-center mx-auto mb-4">
              <GitBranch size={32} />
            </div>
            <h3 className="text-[15px] font-bold text-[#0f1523]">Empty Roadmap</h3>
            <p className="text-[#8a9ab5] text-[13px] mt-2 max-w-xs mx-auto">
              No tasks match your current filters. Adjust your view or create a new roadmap item to begin tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
