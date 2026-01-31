"use client";

import { useState, useEffect } from "react";
import AdminSideNav from "./AdminSideNav";
import NotificationDropdown from "./NotificationDropdown";
import LiveIndicator from "./LiveIndicator";

export default function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Set initial
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className="admin-shell"
      style={{ minHeight: "100vh", backgroundColor: "var(--background-color)" }}
    >
      {/* Mobile Header */}
      <div className="mobile-header">
        <button onClick={toggleSidebar} className="mobile-menu-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
        </button>
        <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
          Dashboard
        </span>
      </div>

      <AdminSideNav isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      <main className={`admin-main ${isCollapsed ? "collapsed" : "expanded"}`}>
        <div
          className="admin-notifications"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1rem",
          }}
        >
          <div className="flex items-center gap-3">
            <LiveIndicator />
            <NotificationDropdown />
          </div>
        </div>
        {children}
      </main>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${!isCollapsed ? "visible" : ""}`}
        onClick={() => setIsCollapsed(true)} // Close sidebar on click (using isCollapsed=true as "closed" state concept or need checking)
      />
    </div>
  );
}
