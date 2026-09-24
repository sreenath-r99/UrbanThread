import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";

import { AdminAuthContext } from "../../context/AdminAuthContext";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const { logout } = useContext(AdminAuthContext);

  const navigationItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: "▦",
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: "▣",
    },
    {
      label: "Inventory",
      icon: "▥",
      path: "/admin/inventory",
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: "⌘",
    },
    {
      label: "Subcategories",
      path: "/admin/subcategories",
      icon: "◈",
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: "▢",
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: "♙",
    },
    {
      label: "Reviews",
      path: "/admin/reviews",
      icon: "✎",
    },
    {
      label: "Coupons",
      path: "/admin/coupons",
      icon: "▤",
    },
    {
      label: "Offers",
      path: "/admin/offers",
      icon: "◇",
    },
    {
      label: "Sales Report",
      path: "/admin/sales-report",
      icon: "⌁",
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: "⚙",
    },
  ];

  const handleLogout = () => {
    logout();

    navigate("/admin/login", {
      replace: true,
    });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[#292929] bg-[#151515]">
      {/* ==========================
          BRAND
      ========================== */}

      <div className="border-b border-[#292929] px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center border border-[#4a4a4a] text-xs font-semibold text-neutral-300">
            UT
          </div>

          <div>
            <h1 className="font-serif text-lg tracking-wide text-white">
              UrbanThread
            </h1>

            <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-neutral-500">
              Admin Console
            </p>
          </div>
        </div>
      </div>

      {/* ==========================
          NAVIGATION
      ========================== */}

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-[#242424] text-white"
                    : "text-neutral-500 hover:bg-[#1e1e1e] hover:text-neutral-200"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`w-5 text-center text-sm ${
                      isActive ? "text-neutral-200" : "text-neutral-600"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>

                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ==========================
          LOGOUT
      ========================== */}

      <div className="border-t border-[#292929] px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-neutral-500 transition hover:bg-[#1e1e1e] hover:text-white"
        >
          <span className="text-base">⇥</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
