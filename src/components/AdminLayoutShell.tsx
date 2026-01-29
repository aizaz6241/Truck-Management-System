"use client";

import { useState } from "react";
import AdminSideNav from "./AdminSideNav";
import NotificationDropdown from "./NotificationDropdown";

export default function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className="admin-shell"
      style={{ minHeight: "100vh", backgroundColor: "var(--background-color)" }}
    >
      <AdminSideNav isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <main
        className="admin-main"
        style={{
          marginLeft: isCollapsed ? "80px" : "250px",
          transition: "margin-left 0.3s ease",
          padding: "2rem",
          width: "auto",
        }}
      >
        <div
          className="admin-notifications"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1rem",
          }}
        >
          <NotificationDropdown />
        </div>
        {children}
      </main>
    </div>
  );
}
