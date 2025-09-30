import React, { useEffect, useMemo, useState } from "react";
import { openBookingDetails } from "./dashboardBus";

function fmtNow(now) {
  return now.toLocaleString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const statusDot = {
  confirmed: "bg-green-500",
  pending: "bg-purple-800",
  cancelled: "bg-red-500",
  completed: "bg-blue-600",
};

const statusLabel = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "-";

const toDate = (v) => {
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

const sameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfPrevMonth = (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1); 
const endOfPrevMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 0);      

const statusStyles = {
  confirmed: "bg-green-500",
  pending: "bg-purple-800",
  cancelled: "bg-red-500",
  completed: "bg-blue-500",
};
const statusText = {
  confirmed: "text-green-700",
  pending: "text-purple-800",
  cancelled: "text-red-600",
  completed: "text-blue-700",
};
const formatDateTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso || "-";
  }
};
const addressOf = (loc = {}) => [loc?.area, loc?.city, loc?.state].filter(Boolean).join(", ");

function Overview() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [bookings, setBookings] = useState([]);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token = useMemo(() => {
    const t =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    return t ? t.replace(/^"+|"+$/g, "") : "";
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setErr("Authentication token not found");
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr("");
      try {
        // Renter scope
        const res = await fetch(`${API_URL}/api/bookings?scope=me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch bookings");
        }
        setBookings(Array.isArray(json.bookings) ? json.bookings : []);
      } catch (e) {
        setErr(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    load();
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, [token]);

  // Metrics (renter view)
  const metrics = useMemo(() => {
    const statuses = bookings.reduce(
      (acc, b) => {
        const k = (b.status || "unknown").toLowerCase();
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      },
      { confirmed: 0, pending: 0, cancelled: 0, completed: 0 }
    );

    const sum = (arr) => arr.reduce((n, b) => n + Number(b.totalAmount || 0), 0);

    const upcoming = bookings.filter((b) => {
      const s = (b.status || "").toLowerCase();
      const t = toDate(b.pickupAt);
      return t && t > now && ["confirmed", "pending"].includes(s);
    });

    const active = bookings.filter((b) => {
      const s = (b.status || "").toLowerCase();
      const p = toDate(b.pickupAt);
      const d = toDate(b.dropoffAt);
      return s === "confirmed" && p && d && p <= now && now < d;
    });

    const paid = bookings.filter((b) =>
      ["confirmed", "completed"].includes((b.status || "").toLowerCase())
    );

    const totalSpent = sum(paid);

    const monthStart = startOfMonth(now);
    const monthSpent = sum(
      paid.filter((b) => {
        const d = toDate(b.pickupAt);
        return d && d >= monthStart;
      })
    );

    const prevMonthStart = startOfPrevMonth(now);   
    const prevMonthEnd = endOfPrevMonth(now);       
    const prevMonthSpent = sum(                    
      paid.filter((b) => {
        const d = toDate(b.pickupAt);
        return d && d >= prevMonthStart && d <= prevMonthEnd;
      })
    );
    const changePct =
      prevMonthSpent > 0 ? ((monthSpent - prevMonthSpent) / prevMonthSpent) * 100 : 0;

    const todaySpent = sum(paid.filter((b) => sameDay(toDate(b.pickupAt), now)));

    const total =
      statuses.confirmed +
        statuses.pending +
        statuses.cancelled +
        statuses.completed || 1;
    const pct = (n) => Math.round((n / total) * 100);

    return {
      upcomingCount: upcoming.length,
      activeCount: active.length,
      totalSpent,
      monthSpent,
      prevMonthSpent,
      changePct,
      todaySpent,
      pctConfirmed: pct(statuses.confirmed),
      pctCompleted: pct(statuses.completed),
      pctPending: pct(statuses.pending),
      pctCancelled: pct(statuses.cancelled),
    };
  }, [bookings, now]);

  const fcur = (n) =>
    `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; 

  const recentBookings = useMemo(() => {
    const upcoming = bookings
      .filter((b) => {
        const t = toDate(b.pickupAt);
        return t && t >= now;
      })
      .sort((a, b) => new Date(a.pickupAt) - new Date(b.pickupAt));
    const past = bookings
      .filter((b) => {
        const t = toDate(b.pickupAt);
        return t && t < now;
      })
      .sort((a, b) => new Date(b.pickupAt) - new Date(a.pickupAt));
    return [...upcoming, ...past].slice(0, 10);
  }, [bookings, now]);

  return (
    <div className="md:flex gap-2">
      <div className="bg-[#f7f6f2] p-4 space-y-4 min-w-[280px]">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Renter</h2>
          <p className="text-xs text-gray-500">{fmtNow(now)}</p>
        </div>

        {/* Trips summary */}
        <div className="bg-white rounded-xl shadow p-4 space-y-1">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Trips</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              Overview
            </span>
          </div>
          <hr className="border-gray-200" style={{ marginTop: "10px" }} />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-[#2f1c53] mt-1">
                {metrics.upcomingCount}
              </p>
              <p className="text-xs text-gray-500">Upcoming</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600 mt-1">
                {metrics.activeCount}
              </p>
              <p className="text-xs text-gray-500">Active now</p>
            </div>
          </div>
        </div>

        {/* REPLACED: Spending summary -> New Total Spending card like screenshot */}
        <div className="bg-white rounded-xl shadow p-4 space-y-1">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span className="font-medium">Total Spending</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">All</span>
          </div>
          <hr className="border-gray-200 mt-2" />
          <div className="mt-2 flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-gray-900">
                {fcur(metrics.totalSpent)}
              </p>
              <span
                className={`text-sm font-semibold ${
                  metrics.changePct >= 0 ? "text-green-600" : "text-red-600"
                }`}
                title="Change vs last month"
              >
                {metrics.changePct >= 0 ? "▲" : "▼"} {Math.abs(metrics.changePct).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">Last Month Spending</span>
            <span className="text-sm text-gray-700 font-medium">
              {fcur(metrics.prevMonthSpent)}
            </span>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
            <span>Trips by status</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              Overall
            </span>
          </div>

          <div className="space-y-2">
            {[
              { label: "Confirmed", color: "bg-green-600", v: metrics.pctConfirmed },
              { label: "Completed", color: "bg-blue-600", v: metrics.pctCompleted },
              { label: "Pending", color: "bg-purple-800", v: metrics.pctPending },
              { label: "Cancelled", color: "bg-red-600", v: metrics.pctCancelled },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{r.label}</span>
                  <span>{r.v}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded">
                  <div
                    className={`h-2 ${r.color} rounded`}
                    style={{ width: `${r.v}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent and upcoming trips */}
      <div className="rounded-xl overflow-hidden w-full bg-white shadow mr-2">
        <div className="px-6 py-3 border-b bg-gray-100">
          <div className="font-semibold text-gray-700">Recent & Upcoming Trips</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr className="text-gray-700">
                <th className="px-6 py-3 font-semibold">No.</th>
                <th className="px-6 py-3 font-semibold">Car</th>
                <th className="px-6 py-3 font-semibold">Owner</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Total</th>
                <th className="px-6 py-3 font-semibold text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : err ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-red-600">
                    {err}
                  </td>
                </tr>
              ) : recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-gray-500">
                    No trips yet.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b, idx) => {
                  const car = b.car || {};
                  const owner = b.owner || b.car?.owner || {};
                  const title =
                    car.name || [car.brand, car.model].filter(Boolean).join(" ") || "-";
                  const ownerName =
                    owner.fullName || owner.name || owner.username || "-";
                  const sKey = (b.status || "").toLowerCase();

                  return (
                    <tr key={b._id || idx} className="hover:bg-gray-50">
                      <td className="px-6 py-3">{(idx + 1).toString().padStart(2, "0")}</td>
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-800">{title}</div>
                        <div className="text-xs text-gray-500">
                          {addressOf(car.location)}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-800">{ownerName}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-3 w-3 rounded-full ${
                              statusStyles[sKey] || "bg-gray-400"
                            }`}
                          />
                          <span
                            className={`font-semibold ${
                              statusText[sKey] || "text-gray-700"
                            }`}
                          >
                            {b.status || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-700">
                        ₹{Number(b.totalAmount || 0).toFixed(0)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          className="text-sm text-white bg-[#2f1c53] hover:bg-[#3f2e6c] px-4 py-1 rounded"
                          onClick={() => openBookingDetails(b._id)} >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Overview;