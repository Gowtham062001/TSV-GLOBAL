"use client";

import React, { useState, useEffect } from "react";
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
import { GripVertical, Edit3, Trash2, ExternalLink, Globe, Clock, Search, List, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/shared/Toast";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  title: string;
  slug: string;
  order: number;
  status: string;
  createdAt: Date | string;
  isVisible: boolean;
  parentId: string | null;
}

export function SortableServiceItem({ service, isChild, onDelete, onToggleVisibility, disabled }: { service: Service; isChild?: boolean; onDelete: (id: string) => void; onToggleVisibility: (id: string, current: boolean) => void; disabled?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: service.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: '#ffffff',
        border: '1px solid #f0f2f8',
        borderRadius: '10px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        position: 'relative',
        marginLeft: isChild ? '32px' : '0'
      }}
      className="group admin-list-row"
    >
      {!disabled && (
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical style={{width: '16px', opacity: 0.3}} />
        </div>
      )}

      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        overflow: 'hidden',
        flexShrink: 0,
        background: '#f0f2f8',
        border: '1px solid #e2e8f0'
      }}>
        <img
          src={(service as any).image || '/assets/img/logo.png'}
          alt={service.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
        />
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-4">
        <div>
          <div style={{fontSize: '15px', fontWeight: 600, color: '#0f1523', fontFamily: 'var(--font-admin)'}}>
            {service.title}
          </div>
          <div className="slug" style={{fontSize: '11px', color: '#8a9ab5'}}>
            ⊘ /{service.slug}
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={() => onToggleVisibility(service.id, service.isVisible)}
          style={{
            fontSize: '11px', fontWeight: 600,
            color: service.isVisible ? '#059669' : '#8a9ab5',
            background: service.isVisible ? 'rgba(16,185,129,0.08)' : 'rgba(138,154,181,0.1)',
            padding: '4px 10px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer'
          }}
          className="hover:opacity-80 transition-opacity"
        >
          • {service.isVisible ? 'VISIBLE' : 'HIDDEN'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={`/services/${service.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: '32px', height: '32px', border: '1px solid #f0f2f8', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'
          }}
          className="hover:bg-[#f0f2f8] transition-colors"
          title="View live page"
        >
          <ExternalLink style={{width: '13px', height: '13px', opacity: 0.5}} color="#0f1523" />
        </a>
        <Link 
          href={`/admin/services/${service.slug || service.id}`} 
          style={{
            width: '32px', height: '32px', border: '1px solid #f0f2f8', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          className="hover:bg-[#f0f2f8] transition-colors"
        >
          <Edit3 style={{width: '14px', height: '14px', opacity: 0.5}} color="#0f1523" />
        </Link>
        <button 
          onClick={() => onDelete(service.id)}
          style={{
            width: '32px', height: '32px', border: '1px solid #f0f2f8', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          className="hover:bg-red-50 hover:border-red-100 transition-colors"
          title="Delete Service"
        >
          <Trash2 style={{width: '14px', height: '14px', opacity: 0.5}} color="#c1000a" />
        </button>
      </div>
    </div>
  );
}

export function ServicesListClient({ initialServices }: { initialServices: Service[] }) {
  const { success: toastSuccess, error: toastError } = useToast();
  const router = useRouter();
  const [items, setItems] = useState(initialServices);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    const saved = localStorage.getItem("services_view_mode") as "list" | "grid";
    if (saved === "list" || saved === "grid") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("services_view_mode", mode);
  };

  const filtered = items.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service? This will permanently delete all associated service sections.")) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
        toastSuccess("Service deleted successfully.");
        router.refresh();
      } else {
        toastError("Failed to delete service.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error deleting service");
    }
  };

  const handleToggleVisibility = async (id: string, currentIsVisible: boolean) => {
    try {
      setItems(prev => prev.map(item => item.id === id ? { ...item, isVisible: !currentIsVisible } : item));
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentIsVisible }),
      });
      if (!res.ok) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, isVisible: currentIsVisible } : item));
        toastError("Failed to update visibility.");
      } else {
        router.refresh();
      }
    } catch (err) {
      setItems(prev => prev.map(item => item.id === id ? { ...item, isVisible: currentIsVisible } : item));
      toastError("Error updating visibility.");
    }
  };
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      setItems(newOrder);
      
      // Persist order
      try {
        await fetch("/api/admin/services/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ids: newOrder.map(i => i.id) 
          }),
        });
      } catch (error) {
        console.error("Failed to persist service order:", error);
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Layout Toggle Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-grow">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9ab5]" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#cbd5e1] rounded-lg outline-none focus:border-[#0f1523] text-[13px]"
          />
        </div>
        <div className="flex border border-[#cbd5e1] rounded-lg p-0.5 bg-white shrink-0">
          <button
            onClick={() => handleViewModeChange('list')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#0f1523] text-white' : 'text-[#8a9ab5] hover:text-[#0f1523]'}`}
            title="List View"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[#0f1523] text-white' : 'text-[#8a9ab5] hover:text-[#0f1523]'}`}
            title="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filtered.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {search.trim() !== "" ? (
                filtered.map((service) => (
                  <SortableServiceItem
                    key={service.id}
                    service={service}
                    isChild={!!service.parentId}
                    onDelete={handleDeleteService}
                    onToggleVisibility={handleToggleVisibility}
                    disabled={true}
                  />
                ))
              ) : (
                items
                  .filter(s => !s.parentId)
                  .sort((a, b) => a.order - b.order)
                  .map((service) => (
                    <React.Fragment key={service.id}>
                      <SortableServiceItem
                        service={service}
                        onDelete={handleDeleteService}
                        onToggleVisibility={handleToggleVisibility}
                        disabled={false}
                      />
                      {items
                        .filter(child => child.parentId === service.id)
                        .sort((a, b) => a.order - b.order)
                        .map(child => (
                          <SortableServiceItem
                            key={child.id}
                            service={child}
                            isChild
                            onDelete={handleDeleteService}
                            onToggleVisibility={handleToggleVisibility}
                            disabled={false}
                          />
                        ))}
                    </React.Fragment>
                  ))
              )}
              {filtered.length === 0 && (
                <div className="p-10 text-center text-[#8a9ab5] text-[13px] border border-[#f0f2f8] rounded-[10px] bg-white">
                  No services found.
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="admin-grid-layout">
          {search.trim() !== "" ? (
            filtered.map((service) => {
              const parentService = service.parentId ? items.find(p => p.id === service.parentId) : null;
              const isChild = !!service.parentId;

              return (
                <div
                  key={service.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#fff',
                    border: isChild ? '2px solid #e2e8f0' : '2px solid #cbd5e1',
                    borderLeft: isChild ? '4px solid #2563eb' : '2px solid #cbd5e1',
                    borderRadius: 10,
                    overflow: 'hidden',
                    transition: 'border-color 0.15s',
                    marginLeft: isChild ? '12px' : '0',
                    boxShadow: isChild ? 'none' : '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                  onMouseEnter={e => {
                    if (isChild) {
                      e.currentTarget.style.borderTopColor = '#0f1523';
                      e.currentTarget.style.borderRightColor = '#0f1523';
                      e.currentTarget.style.borderBottomColor = '#0f1523';
                    } else {
                      e.currentTarget.style.borderColor = '#0f1523';
                    }
                  }}
                  onMouseLeave={e => {
                    if (isChild) {
                      e.currentTarget.style.borderTopColor = '#e2e8f0';
                      e.currentTarget.style.borderRightColor = '#e2e8f0';
                      e.currentTarget.style.borderBottomColor = '#e2e8f0';
                    } else {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: 120, background: '#f0f2f8', overflow: 'hidden' }}>
                    <img
                      src={(service as any).image || '/assets/img/logo.png'}
                      alt={service.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
                    />
                    {isChild && (
                      <span style={{
                        position: 'absolute', top: 8, left: 8,
                        fontSize: 9, fontWeight: 700, padding: '2px 6px',
                        borderRadius: 20, background: 'rgba(59,130,246,0.1)',
                        color: '#2563eb', textTransform: 'uppercase',
                        letterSpacing: '0.4px'
                      }}>
                        Sub-service
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, minHeight: 60 }}>
                      <p style={{
                        fontSize: 14, fontWeight: 600, color: '#0f1523',
                        margin: '0 0 3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4'
                      }}>
                        {service.title}
                      </p>
                      <p style={{ fontSize: 11, color: '#8a9ab5', margin: '0 0 4px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        /{service.slug}
                      </p>
                      {isChild && parentService && (
                        <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>
                          Parent: <span className="font-semibold text-[#0f1523]">{parentService.title}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#f0f2f8]">
                      <button
                        onClick={() => handleToggleVisibility(service.id, service.isVisible)}
                        style={{
                          fontSize: '10px', fontWeight: 700,
                          color: service.isVisible ? '#059669' : '#8a9ab5',
                          background: service.isVisible ? 'rgba(16,185,129,0.08)' : 'rgba(138,154,181,0.1)',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        className="hover:opacity-80 transition-opacity"
                      >
                        • {service.isVisible ? 'VISIBLE' : 'HIDDEN'}
                      </button>
                      <span style={{ fontSize: 10, color: '#8a9ab5' }}>
                        Order: {service.order}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, padding: '10px 16px', background: '#fcfdfe', borderTop: '1px solid #f0f2f8' }}>
                    <a
                      href={`/services/${service.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ flex: 1, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: '#fff', gap: 4 }}
                      className="hover:bg-[#f0f2f8]"
                      title="View live page"
                    >
                      <ExternalLink style={{ width: 12, height: 12, opacity: 0.5 }} color="#0f1523" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#0f1523' }}>View</span>
                    </a>
                    <Link
                      href={`/admin/services/${service.slug || service.id}`}
                      style={{ flex: 1, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                      className="hover:bg-[#f0f2f8]"
                    >
                      <Edit3 style={{ width: 12, height: 12, opacity: 0.5 }} color="#0f1523" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#0f1523' }}>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      style={{ width: 30, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', cursor: 'pointer' }}
                      className="hover:bg-red-50 hover:border-red-100 shrink-0"
                      title="Delete Service"
                    >
                      <Trash2 style={{ width: 12, height: 12, opacity: 0.5 }} color="#c1000a" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            items
              .filter(s => !s.parentId)
              .sort((a, b) => a.order - b.order)
              .map((service) => {
                const subServices = items
                  .filter(child => child.parentId === service.id)
                  .sort((a, b) => a.order - b.order);

                return (
                  <React.Fragment key={service.id}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#fff',
                        border: '2px solid #cbd5e1',
                        borderRadius: 10,
                        overflow: 'hidden',
                        transition: 'border-color 0.15s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#0f1523')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
                    >
                      <div style={{ position: 'relative', width: '100%', height: 120, background: '#f0f2f8', overflow: 'hidden' }}>
                        <img
                          src={(service as any).image || '/assets/img/logo.png'}
                          alt={service.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
                        />
                      </div>

                      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, minHeight: 60 }}>
                          <p style={{
                            fontSize: 14, fontWeight: 600, color: '#0f1523',
                            margin: '0 0 3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4'
                          }}>
                            {service.title}
                          </p>
                          <p style={{ fontSize: 11, color: '#8a9ab5', margin: '0 0 4px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            /{service.slug}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#f0f2f8]">
                          <button
                            onClick={() => handleToggleVisibility(service.id, service.isVisible)}
                            style={{
                              fontSize: '10px', fontWeight: 700,
                              color: service.isVisible ? '#059669' : '#8a9ab5',
                              background: service.isVisible ? 'rgba(16,185,129,0.08)' : 'rgba(138,154,181,0.1)',
                              padding: '3px 10px',
                              borderRadius: '20px',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            className="hover:opacity-80 transition-opacity"
                          >
                            • {service.isVisible ? 'VISIBLE' : 'HIDDEN'}
                          </button>
                          <span style={{ fontSize: 10, color: '#8a9ab5' }}>
                            Order: {service.order}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, padding: '10px 16px', background: '#fcfdfe', borderTop: '1px solid #f0f2f8' }}>
                        <a
                          href={`/services/${service.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ flex: 1, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: '#fff', gap: 4 }}
                          className="hover:bg-[#f0f2f8]"
                          title="View live page"
                        >
                          <ExternalLink style={{ width: 12, height: 12, opacity: 0.5 }} color="#0f1523" />
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#0f1523' }}>View</span>
                        </a>
                        <Link
                          href={`/admin/services/${service.slug || service.id}`}
                          style={{ flex: 1, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                          className="hover:bg-[#f0f2f8]"
                        >
                          <Edit3 style={{ width: 12, height: 12, opacity: 0.5 }} color="#0f1523" />
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#0f1523' }}>Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          style={{ width: 30, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', cursor: 'pointer' }}
                          className="hover:bg-red-50 hover:border-red-100 shrink-0"
                          title="Delete Service"
                        >
                          <Trash2 style={{ width: 12, height: 12, opacity: 0.5 }} color="#c1000a" />
                        </button>
                      </div>
                    </div>

                    {subServices.map(child => (
                      <div
                        key={child.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          background: '#fff',
                          border: '2px solid #e2e8f0',
                          borderRadius: 10,
                          overflow: 'hidden',
                          transition: 'border-color 0.15s',
                          borderLeft: '4px solid #2563eb'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderTopColor = '#0f1523';
                          e.currentTarget.style.borderRightColor = '#0f1523';
                          e.currentTarget.style.borderBottomColor = '#0f1523';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderTopColor = '#e2e8f0';
                          e.currentTarget.style.borderRightColor = '#e2e8f0';
                          e.currentTarget.style.borderBottomColor = '#e2e8f0';
                        }}
                      >
                        <div style={{ position: 'relative', width: '100%', height: 120, background: '#f0f2f8', overflow: 'hidden' }}>
                          <img
                            src={(child as any).image || '/assets/img/logo.png'}
                            alt={child.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
                          />
                          <span style={{
                            position: 'absolute', top: 8, left: 8,
                            fontSize: 9, fontWeight: 700, padding: '2px 6px',
                            borderRadius: 20, background: 'rgba(59,130,246,0.1)',
                            color: '#2563eb', textTransform: 'uppercase',
                            letterSpacing: '0.4px'
                          }}>
                            Sub-service
                          </span>
                        </div>

                        <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div style={{ flex: 1, minHeight: 60 }}>
                            <p style={{
                              fontSize: 14, fontWeight: 600, color: '#0f1523',
                              margin: '0 0 3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4'
                            }}>
                              {child.title}
                            </p>
                            <p style={{ fontSize: 11, color: '#8a9ab5', margin: '0 0 4px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              /{child.slug}
                            </p>
                            <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>
                              Parent: <span className="font-semibold text-[#0f1523]">{service.title}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#f0f2f8]">
                            <button
                              onClick={() => handleToggleVisibility(child.id, child.isVisible)}
                              style={{
                                fontSize: '10px', fontWeight: 700,
                                color: child.isVisible ? '#059669' : '#8a9ab5',
                                background: child.isVisible ? 'rgba(16,185,129,0.08)' : 'rgba(138,154,181,0.1)',
                                padding: '3px 10px',
                                borderRadius: '20px',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                              className="hover:opacity-80 transition-opacity"
                            >
                              • {child.isVisible ? 'VISIBLE' : 'HIDDEN'}
                            </button>
                            <span style={{ fontSize: 10, color: '#8a9ab5' }}>
                              Order: {child.order}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, padding: '10px 16px', background: '#fcfdfe', borderTop: '1px solid #f0f2f8' }}>
                          <a
                            href={`/services/${child.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ flex: 1, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: '#fff', gap: 4 }}
                            className="hover:bg-[#f0f2f8]"
                            title="View live page"
                          >
                            <ExternalLink style={{ width: 12, height: 12, opacity: 0.5 }} color="#0f1523" />
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#0f1523' }}>View</span>
                          </a>
                          <Link
                            href={`/admin/services/${child.slug || child.id}`}
                            style={{ flex: 1, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            className="hover:bg-[#f0f2f8]"
                          >
                            <Edit3 style={{ width: 12, height: 12, opacity: 0.5 }} color="#0f1523" />
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#0f1523' }}>Edit</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteService(child.id)}
                            style={{ width: 30, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', cursor: 'pointer' }}
                            className="hover:bg-red-50 hover:border-red-100 shrink-0"
                            title="Delete Service"
                          >
                            <Trash2 style={{ width: 12, height: 12, opacity: 0.5 }} color="#c1000a" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                );
              })
          )}
          {filtered.length === 0 && (
            <div className="col-span-full p-10 text-center text-[#8a9ab5] text-[13px] border border-[#f0f2f8] rounded-[10px] bg-white">
              No services found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
