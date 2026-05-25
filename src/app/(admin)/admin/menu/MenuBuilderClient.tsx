"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2, Link as LinkIcon, Plus, Save, X, Globe } from "lucide-react";
import { useToast } from "@/components/shared/Toast";
import { useRouter } from "next/navigation";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
  parentId: string | null;
  target?: string;
  isActive?: boolean;
}

function SortableMenuItem({ 
  item, 
  onEdit, 
  onDelete,
  onToggleVisibility
}: { 
  item: MenuItem, 
  onEdit: (item: MenuItem) => void,
  onDelete: (id: string) => void,
  onToggleVisibility: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 bg-white p-3 border rounded-xl shadow-sm hover:border-[#c1000a] transition-all group ${!item.isActive ? 'opacity-60 bg-slate-50' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-[#c1000a]">
        <GripVertical size={18} />
      </div>
      <div className="flex-1 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.isActive ? 'bg-red-50 text-[#c1000a]' : 'bg-slate-200 text-slate-400'}`}>
          <Globe size={14} />
        </div>
        <div className="min-w-0">
          <div className={`font-bold text-sm truncate ${!item.isActive ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.label}</div>
          <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 font-mono uppercase tracking-widest">
            <LinkIcon size={10} /> {item.url}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Toggle Visibility */}
        <button
          onClick={() => onToggleVisibility(item.id)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
            item.isActive 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
          {item.isActive ? "VISIBLE" : "HIDDEN"}
        </button>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => onEdit(item)}
            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-slate-400 hover:text-[#c1000a] rounded-lg hover:bg-red-50 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function MenuBuilderClient({ 
  initialItems, 
  availablePages = [], 
  availableBlogs = [] 
}: { 
  initialItems: MenuItem[],
  availablePages?: { label: string, url: string }[],
  availableBlogs?: { label: string, url: string }[]
}) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const { success, error: toastError, info } = useToast();
  const router = useRouter();

  // Reconstruct tree for display
  const buildTree = (parentId: string | null = null, depth = 0): (MenuItem & { depth: number })[] => {
    return items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .reduce((acc, item) => {
        return [...acc, { ...item, depth }, ...buildTree(item.id, depth + 1)];
      }, [] as (MenuItem & { depth: number })[]);
  };

  const treeItems = buildTree(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleRestoreDefault() {
    if (!confirm("This will replace your current menu with the default seed data. Continue?")) return;
    setIsRestoring(true);
    try {
      const res = await fetch("/api/admin/menu/seed", { method: "POST" });
      if (res.ok) {
        success("Menu restored successfully!");
        window.location.reload(); 
      } else {
        const errorData = await res.json().catch(() => ({}));
        toastError(errorData.error || "Failed to restore menu.");
      }
    } catch (err: any) {
      toastError(err.message || "Error restoring menu.");
    } finally {
      setIsRestoring(false);
    }
  }

  async function handleSaveOrder() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        success("Navigation synchronized!");
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toastError(errorData.error || "Sync failed.");
      }
    } catch (error: any) {
      toastError(error.message || "Error saving menu.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;

    const isNew = !editingItem.id;
    if (isNew) {
      const newItem = {
        ...editingItem,
        id: `temp-${Date.now()}`,
        order: items.filter(i => i.parentId === (editingItem.parentId || null)).length,
        isActive: true,
      } as MenuItem;
      setItems([...items, newItem]);
    } else {
      setItems(items.map(i => i.id === editingItem.id ? { ...i, ...editingItem } as MenuItem : i));
    }
    
    setEditingItem(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this menu item? Children will also be affected.")) return;
    
    if (!id.startsWith("temp-")) {
      try {
        const res = await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
        if (res.ok) {
          setItems(items.filter(i => i.id !== id && i.parentId !== id));
          success("Item removed");
        }
      } catch (error) {
        toastError("Delete failed");
      }
    } else {
      setItems(items.filter(i => i.id !== id && i.parentId !== id));
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const activeItem = prev.find(i => i.id === active.id);
        const overItem = prev.find(i => i.id === over.id);
        
        if (!activeItem || !overItem) return prev;
        
        if (activeItem.parentId !== overItem.parentId) {
          info("Move across levels disabled. Use 'Edit' to change parent.");
          return prev;
        }

        const sameLevelItems = prev.filter(i => i.parentId === activeItem.parentId);
        const oldIndex = sameLevelItems.findIndex((i) => i.id === active.id);
        const newIndex = sameLevelItems.findIndex((i) => i.id === over.id);
        
        const reorderedLevel = arrayMove(sameLevelItems, oldIndex, newIndex).map((item, idx) => ({ ...item, order: idx }));
        
        return prev.map(item => {
          const updated = reorderedLevel.find(u => u.id === item.id);
          return updated || item;
        });
      });
    }
  }

  async function handleToggleVisibility(id: string) {
    setItems(items.map(i => i.id === id ? { ...i, isActive: !i.isActive } : i));
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-['Outfit']">Navigation Engine</span>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">Structure Management</h3>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRestoreDefault}
            disabled={isRestoring}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm font-['Outfit']"
          >
            {isRestoring ? <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div> : <Globe size={16} />}
            Restore Default
          </button>
          <button 
            onClick={() => setEditingItem({ label: "", url: "/", target: "_self", isActive: true, parentId: null })}
            className="flex items-center gap-2 px-6 py-3 bg-[#c1000a] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#a00008] transition-all shadow-xl shadow-red-900/10 font-['Outfit']"
          >
            <Plus size={16} /> New Link
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[400px]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={treeItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {treeItems.map((item) => (
                <div key={item.id} style={{ marginLeft: `${item.depth * 32}px` }}>
                  <SortableMenuItem 
                    item={item} 
                    onEdit={setEditingItem}
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {items.length === 0 && (
        <div className="p-16 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <LinkIcon className="mx-auto text-slate-200 mb-4" size={40} />
          <p className="text-slate-400 text-sm font-medium">No menu items found. Click 'Restore Default' to start.</p>
        </div>
      )}

      <div className="pt-6 border-t flex justify-end">
        <button 
          onClick={handleSaveOrder}
          disabled={isSaving}
          className="bg-[#0f172a] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#c1000a] transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save size={18} />
          )}
          {isSaving ? "Syncing..." : "Sync Navigation"}
        </button>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{editingItem.id ? "Edit Link" : "New Link"}</h3>
              <button onClick={() => setEditingItem(null)} className="p-2 text-slate-400 hover:text-[#c1000a] rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleItemSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Label</label>
                  <input 
                    required
                    type="text" 
                    value={editingItem.label}
                    onChange={(e) => setEditingItem({...editingItem, label: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#c1000a]/5 focus:border-[#c1000a] outline-none text-sm font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Parent</label>
                  <select 
                    value={editingItem.parentId || ""}
                    onChange={(e) => setEditingItem({...editingItem, parentId: e.target.value || null})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    <option value="">(Root)</option>
                    {items.filter(i => i.id !== editingItem.id).map(i => (
                      <option key={i.id} value={i.id}>{i.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Content Link</label>
                <select 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const [url, label] = val.split('|');
                    setEditingItem({ ...editingItem, url, label });
                  }}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                >
                  <option value="">-- Quick Link --</option>
                  {availablePages.map(p => <option key={p.url} value={`${p.url}|${p.label}`}>{p.label}</option>)}
                  {availableBlogs.map(b => <option key={b.url} value={`${b.url}|${b.label}`}>{b.label}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">URL</label>
                <input 
                  required
                  type="text" 
                  value={editingItem.url}
                  onChange={(e) => setEditingItem({...editingItem, url: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Target</label>
                  <select 
                    value={editingItem.target}
                    onChange={(e) => setEditingItem({...editingItem, target: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    <option value="_self">Same Tab</option>
                    <option value="_blank">New Tab</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Status</label>
                  <button
                    type="button"
                    onClick={() => setEditingItem({...editingItem, isActive: !editingItem.isActive})}
                    className={`w-full py-2 rounded-lg font-bold text-xs border transition-all ${
                      editingItem.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    {editingItem.isActive ? "Visible" : "Hidden"}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-lg font-bold text-sm">Cancel</button>
                <button type="submit" className="flex-[2] py-2.5 bg-[#c1000a] text-white rounded-lg font-bold text-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

