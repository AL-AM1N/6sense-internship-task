"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

import {
  FaHome,
  FaBuilding,
  FaCity,
  FaBox,
  FaFileInvoice,
  FaUsers,
  FaUser,
  FaLink,
  FaCoins,
  FaIdBadge,
  FaRobot,
  FaChartBar,
  FaCog,
  FaBars,
  FaTimes,
} from "react-icons/fa";

type Props = {
  children: ReactNode;
};

const menuGroups = [
  {
    label: "",
    items: [
      { title: "Overview", href: "/dashboard", icon: FaHome },
      { title: "Studios", href: "/dashboard/studios", icon: FaBuilding },
      { title: "Companies", href: "/dashboard/companies", icon: FaCity },
      { title: "Products", href: "/dashboard/products", icon: FaBox },
    ],
  },
  {
    label: "ACCOUNTING",
    items: [
      { title: "Invoices", href: "/dashboard/invoices", icon: FaFileInvoice },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { title: "Team", href: "/dashboard/team", icon: FaUsers },
      { title: "Users", href: "/dashboard/users", icon: FaUser },
    ],
  },
  {
    label: "RESOURCES",
    items: [
      { title: "Tools", href: "/dashboard/tools", icon: FaLink },
      { title: "Rates", href: "/dashboard/rates", icon: FaCoins },
      { title: "Roles", href: "/dashboard/roles", icon: FaIdBadge },
    ],
  },
  {
    label: "APPLICATION",
    items: [
      { title: "AI Assistant", href: "/dashboard/ai", icon: FaRobot },
      { title: "Reports", href: "/dashboard/reports", icon: FaChartBar },
      { title: "Settings", href: "/dashboard/settings", icon: FaCog },
    ],
  },
];

export default function DashboardLayout({ children }: Props) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-full w-72 bg-white shadow-sm flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >

        {/* Logo (fixed) */}
        <div className="p-5 shrink-0 bg-white">
          <img className="w-30" src="/image.png" alt="logo" />
        </div>

        {/* Menu (ONLY this scrolls) */}
        <nav className="p-4 space-y-6 overflow-y-auto flex-1">

          {menuGroups.map((group, idx) => (
            <div key={idx}>

              {group.label && (
                <p className="px-3 mb-2 text-xs font-semibold text-gray-400 tracking-wider">
                  {group.label}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition
                        ${
                          isActive
                            ? "bg-blue-100 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      <Icon className="text-sm" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>

            </div>
          ))}

        </nav>
      </aside>

      {/* ================= OVERLAY (mobile) ================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= MAIN AREA ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Topbar (mobile only) */}
        <div className="lg:hidden flex items-center gap-3 bg-white p-4 shadow shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}
          </button>
        </div>

        {/* Page Content (THIS scrolls independently) */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  );
}