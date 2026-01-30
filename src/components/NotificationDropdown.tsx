"use client";

import { useState, useEffect } from "react";
import {
  getAdminNotifications,
  dismissNotification,
  NotificationItem,
} from "@/actions/notifications";
import { useLanguage } from "./LanguageProvider";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getAdminNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotes();
    // Poll every minute? Or just on mount.
  }, []);

  const unreadCount = notifications.length;

  return (
    <div style={{ position: "relative", marginRight: "1rem" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: "0.5rem",
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              backgroundColor: "red",
              color: "white",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              fontSize: "0.7rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            width: "300px",
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: 1000,
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "0.75rem",
              borderBottom: "1px solid #eee",
              fontWeight: "bold",
            }}
          >
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div
              style={{ padding: "1rem", textAlign: "center", color: "#666" }}
            >
              No new notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "0.75rem",
                  borderBottom: "1px solid #eee",
                  position: "relative",
                }}
              >
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    // Optimistically remove from UI
                    setNotifications((prev) =>
                      prev.filter((item) => item.id !== n.id),
                    );
                    await dismissNotification(n.id);
                  }}
                  style={{
                    position: "absolute",
                    top: "0.5rem",
                    right: "0.5rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#999",
                    fontSize: "1rem",
                    lineHeight: 1,
                  }}
                  title="Dismiss"
                >
                  &times;
                </button>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    color: n.type === "CONTRACT_EXPIRY" ? "#d9534f" : "#f0ad4e",
                    paddingRight: "1.5rem", // Space for close button
                  }}
                >
                  {n.type === "CONTRACT_EXPIRY"
                    ? "Contract Expiry"
                    : "Vehicle Registration"}
                </div>
                <div style={{ fontSize: "0.9rem", margin: "0.25rem 0" }}>
                  {n.message}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#888" }}>
                  Due: {new Date(n.date).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
