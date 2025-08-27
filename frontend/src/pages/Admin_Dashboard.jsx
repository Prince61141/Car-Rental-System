import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/Admin_Dashboard/Sidebar";
import AdminTopbar from "../components/Admin_Dashboard/Topbar";
import { getAdminStats } from "../utils/adminApi";
import CompletedBookings from "../components/Admin_Dashboard/CompletedBookings";
import AdminTransactions from "../components/Admin_Dashboard/Transactions";
import Users from "../components/Admin_Dashboard/Users";

export default function Admin_Dashboard() {
  const [tab, setTab] = useState("Completed");
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const data = await getAdminStats().catch(() => ({}));
      if (data?.success) setStats(data.stats);
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderTab = () => {
    if (tab === "Completed") return <CompletedBookings />;
    if (tab === "Transactions") return <AdminTransactions />;
    return <Users />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        active={tab}
        setActive={setTab}
        open={open}
        setOpen={setOpen}
      />

      <div className="flex-1 flex flex-col">
        <AdminTopbar onMenuClick={() => setOpen(true)} name="Admin" />

        <div className="px-6 py-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{tab}</h1>
            <div className="flex items-center gap-4">
              {stats && (
                <div className="hidden sm:flex gap-4 text-sm">
                  <div>
                    Bookings: {stats.bookings.total} (C:
                    {stats.bookings.completed})
                  </div>
                  <div>
                    Transactions: {stats.transactions.total} • ₹
                    {Number(stats.transactions.amount || 0).toFixed(0)}
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">{renderTab()}</div>
      </div>
    </div>
  );
}