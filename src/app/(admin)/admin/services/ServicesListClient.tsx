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
import { GripVertical, Edit3, Trash2, ExternalLink, Box, Globe, Clock } from "lucide-react";
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

export function SortableServiceItem({ service, isChild, onDelete, onToggleVisibility }: { service: Service; isChild?: boolean; onDelete: (id: string) => void; onToggleVisibility: (id: string, current: boolean) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: service.id });

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
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical style={{width: '16px', opacity: 0.3}} />
      </div>

      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(193,0,10,0.08)',
        border: '1px solid rgba(193,0,10,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Box color="#c1000a" style={{width: '15px', height: '15px', opacity: 0.7}} />
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6">
          {items
            .filter(s => !s.parentId)
            .sort((a, b) => a.order - b.order)
            .map((service) => (
            <React.Fragment key={service.id}>
              <SortableServiceItem service={service} onDelete={handleDeleteService} onToggleVisibility={handleToggleVisibility} />
              {items
                .filter(child => child.parentId === service.id)
                .sort((a, b) => a.order - b.order)
                .map(child => (
                <SortableServiceItem key={child.id} service={child} isChild onDelete={handleDeleteService} onToggleVisibility={handleToggleVisibility} />
              ))}
            </React.Fragment>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
