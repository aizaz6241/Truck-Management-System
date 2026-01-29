"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { useRouter, usePathname } from "next/navigation";
import { useLoading } from "@/components/LoadingProvider";

// Icons (Simple SVGs)
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const TruckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 18H3c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1h4.2c.2 0 .4.1.6.2L12 13l4.2-4.8c.2-.2.4-.2.6-.2H21c.6 0 1 .4 1 1v8c0 .6-.4 1-1 1h-2" />
    <path d="M13 18h2" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MapIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" x2="9" y1="3" y2="18" />
    <line x1="15" x2="15" y1="6" y2="21" />
  </svg>
);

const FileTextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LogOutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const MenuIcon = () => (
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
);

const ChevronLeftIcon = () => (
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
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

interface AdminSideNavProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

function MapPinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}

const ImageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const DropletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2.69l5.74 9.2a6 6 0 1 1-9.48 0L12 2.69Z" />
  </svg>
);

export default function AdminSideNav({
  isCollapsed,
  toggleSidebar,
}: AdminSideNavProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const { startLoading } = useLoading();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleLinkClick = (href: string) => {
    if (pathname !== href) {
      startLoading();
    }
  };

  const navItems = [
    { href: "/admin", label: t("nav.home"), icon: <HomeIcon /> },
    { href: "/admin/vehicles", label: t("nav.vehicles"), icon: <TruckIcon /> },
    { href: "/admin/drivers", label: t("nav.drivers"), icon: <UsersIcon /> },
    { href: "/admin/trips", label: t("nav.trips"), icon: <MapIcon /> },
    {
      href: "/admin/invoices",
      label: "Invoices",
      icon: <FileTextIcon />,
    },
    { href: "/admin/sites", label: "Sites", icon: <MapPinIcon /> },
    {
      href: "/admin/contractors",
      label: "Contractors",
      icon: <UsersIcon />,
    },
    {
      href: "/admin/pictures/trip-papers",
      label: "Trip Papers",
      icon: <ImageIcon />,
    },
    {
      href: "/admin/pictures/cheques",
      label: "Cheques",
      icon: <ImageIcon />,
    },
    { href: "/admin/payments", label: "Payments", icon: <FileTextIcon /> },
    { href: "/admin/diesel", label: "Diesel", icon: <DropletIcon /> },
    { href: "/admin/logs", label: "Logs", icon: <FileTextIcon /> },
    { href: "/admin/settings", label: "Settings", icon: <SettingsIcon /> },
    { href: "/admin/statements", label: "Statements", icon: <FileTextIcon /> },
  ];

  return (
    <nav
      className="admin-sidebar"
      style={{
        width: isCollapsed ? "80px" : "250px",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        backgroundColor: "var(--surface-color)",
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        zIndex: 50,
        overflowX: "hidden",
        boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          borderBottom: "1px solid var(--border-color)",
          height: "70px",
        }}
      >
        {!isCollapsed && (
          <div
            style={{
              fontWeight: "bold",
              fontSize: "1.1rem",
              color: "var(--primary-color)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {t("app.title")}
          </div>
        )}

        <button
          onClick={toggleSidebar}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: isCollapsed ? 0 : "auto",
          }}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      <div
        style={{
          flex: 1,
          padding: "1rem 0",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) && item.href !== "/admin");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleLinkClick(item.href)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0.75rem 1.5rem",
                color: isActive
                  ? "var(--primary-color)"
                  : "var(--text-secondary)",
                backgroundColor: isActive
                  ? "rgba(0, 86, 179, 0.05)"
                  : "transparent",
                borderLeft: isActive
                  ? "4px solid var(--primary-color)"
                  : "4px solid transparent",
                textDecoration: "none",
                justifyContent: isCollapsed ? "center" : "flex-start",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                height: "50px",
              }}
              title={isCollapsed ? item.label : ""}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </span>
              {!isCollapsed && (
                <span
                  style={{
                    marginLeft: "1rem",
                    fontWeight: isActive ? "600" : "500",
                  }}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div
        style={{ padding: "1rem", borderTop: "1px solid var(--border-color)" }}
      >
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            color: "var(--danger-color)",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            width: "100%",
            padding: "0.5rem",
          }}
          title={isCollapsed ? t("nav.logout") : ""}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogOutIcon />
          </span>
          {!isCollapsed && (
            <span style={{ marginLeft: "1rem" }}>{t("nav.logout")}</span>
          )}
        </button>
      </div>
    </nav>
  );
}
