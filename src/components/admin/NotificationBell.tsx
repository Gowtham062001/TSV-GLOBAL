"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Mail, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchCount = async () => {
    try {
      const res = await fetch("/api/admin/notifications/count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch {}
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = () => {
    if (!isOpen) fetchNotifications();
    setIsOpen(!isOpen);
  };

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/admin/notifications/read-all", { method: "PATCH" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) markRead(n.id);
    if (n.link) router.push(n.link);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl hover:bg-slate-100"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: 8, right: 8,
            width: 8, height: 8,
            background: "#c1000a",
            borderRadius: "50%",
            border: "2px solid #fff"
          }} />
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 360,
          background: "#fff",
          border: "1px solid #f0f2f8",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          zIndex: 300,
          overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid #f0f2f8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f1523" }}>
              Notifications {unreadCount > 0 && (
                <span style={{
                  marginLeft: 6, fontSize: 10, fontWeight: 700,
                  background: "#c1000a", color: "#fff",
                  padding: "1px 6px", borderRadius: 20
                }}>{unreadCount}</span>
              )}
            </span>
            <button
              onClick={markAllRead}
              style={{ fontSize: 11, color: "#c1000a", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              Mark all read
            </button>
          </div>

          {/* Notifications list */}
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {loading && (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#8a9ab5", fontSize: 13 }}>
                Loading...
              </div>
            )}
            {!loading && notifications.length === 0 && (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#8a9ab5", fontSize: 13 }}>
                No notifications yet
              </div>
            )}
            {notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "12px 16px",
                  background: n.isRead ? "#fff" : "#fef9f9",
                  textDecoration: "none",
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  borderBottom: "1px solid #f8f9fb",
                  cursor: "pointer",
                  transition: "background 0.15s"
                } as React.CSSProperties}
              >
                {/* Type icon */}
                <div style={{
                  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                  background: n.type === "LEAD" ? "rgba(193,0,10,0.08)" : "rgba(59,130,246,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {n.type === "LEAD"
                    ? <Mail size={16} color="#c1000a" />
                    : <FileText size={16} color="#2563eb" />
                  }
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: n.isRead ? 400 : 600,
                    color: "#0f1523", margin: "0 0 2px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>
                    {n.title}
                  </p>
                  <p style={{
                    fontSize: 11.5, color: "#8a9ab5", margin: 0,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>
                    {n.message}
                  </p>
                </div>

                {/* Right side */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 10.5, color: "#aaa" }}>
                    {timeAgo(n.createdAt)}
                  </span>
                  {!n.isRead && (
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "#c1000a"
                    }} />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 16px", borderTop: "1px solid #f0f2f8", textAlign: "center" }}>
            <a
              href="/admin/notifications"
              style={{ fontSize: 12, color: "#c1000a", fontWeight: 600, textDecoration: "none" }}
            >
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
