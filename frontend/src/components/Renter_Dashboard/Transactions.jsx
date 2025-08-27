import React, { useEffect, useMemo, useState } from "react";
import {
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { MdTrendingUp, MdTrendingDown, MdReceiptLong } from "react-icons/md";

const fmtINR = (v) =>
  typeof v === "number"
    ? v.toLocaleString("en-IN", { maximumFractionDigits: 0 })
    : Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const fmtDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusBadge = (s) => {
  const key = String(s || "").toLowerCase();
  if (["paid", "success"].includes(key))
    return "bg-green-100 text-green-700 border border-green-200";
  if (["pending", "processing", "unpaid"].includes(key))
    return "bg-amber-100 text-amber-800 border border-amber-200";
  if (["failed", "declined"].includes(key))
    return "bg-red-100 text-red-700 border border-red-200";
  if (["refunded", "refund"].includes(key))
    return "bg-blue-100 text-blue-700 border border-blue-200";
  return "bg-gray-100 text-gray-700 border border-gray-200";
};

const typeBadge = (t) => {
  const key = String(t || "").toLowerCase();
  if (["booking", "charge"].includes(key))
    return "bg-rose-50 text-rose-700 border border-rose-200";
  if (["cancel"].includes(key))
    return "bg-blue-50 text-blue-700 border border-blue-200";
  if (["charges"].includes(key))
    return "bg-slate-50 text-slate-700 border border-slate-200";
  return "bg-gray-50 text-gray-700 border border-gray-200";
};

const decodeJwtId = (token) => {
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const p = JSON.parse(json);
    return (
      p.renterId ||
      p.userId ||
      p.id ||
      p._id ||
      p.sub ||
      null
    );
  } catch {
    return null;
  }
};
const getRenterId = async (headers) => {
  const cached = localStorage.getItem("renterId");
  if (cached) return cached;
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  const fromJwt = token ? decodeJwtId(token) : null;
  if (fromJwt) {
    return fromJwt;
  }
  try {
    const res = await fetch("http://localhost:5000/api/renters/me", { headers });
    if (res.ok) {
      const data = await res.json();
      const id = data?.user?._id || data?._id || data?.id || null;
      if (id) {
        return id;
      }
    }
  } catch {}
  return null;
};

function RenterTransactions() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    monthSpent: 0,
    lifetimeSpent: 0,
    refundsReceived: 0,
    pendingPayments: 0,
    lastUpdated: null,
  });

  // Filters
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("all"); // booking | refund | fee
  const [status, setStatus] = useState("all"); // paid | pending | failed | refunded

  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Renter ID (backend expects ?renterId= or x-renter-id)
      const renterId = await getRenterId(headers);
      if (!renterId) {
        setErr("Renter ID not found. Please re-login.");
        setRows([]);
        setLoading(false);
        return;
      }
      const hdrs = { ...headers, "x-renter-id": renterId };

      // Try common endpoints
      const endpoints = [
        `http://localhost:5000/api/transactions/renter?renterId=${encodeURIComponent(renterId)}`,
        `http://localhost:5000/api/renters/transactions?renterId=${encodeURIComponent(renterId)}`,
      ];

      let payload = null;
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { headers: hdrs });
          if (res.ok) {
            payload = await res.json();
            break;
          }
        } catch {}
      }
      if (!payload) throw new Error("Failed to load transactions");

      // Normalize array
      const txs = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.transactions)
        ? payload.transactions
        : Array.isArray(payload)
        ? payload
        : [];

      const mapRow = (t) => {
        const amt = typeof t.amount === "number" ? t.amount : Number(t.amount || t.total || 0);
        const rawType = String(t.type || "").toLowerCase();
        // For renter: bookings/fees = money out (debit), refunds = money in (credit)
        const isRefund = rawType === "refund" || String(t.status || "").toLowerCase() === "refunded";
        const direction = isRefund ? "credit" : "debit";

        return {
          id: t._id || t.id || t.reference || t.txnId || Math.random().toString(36).slice(2),
          createdAt: t.createdAt || t.date || t.time || new Date().toISOString(),
          type: rawType || (isRefund ? "refund" : "booking"),
          status: t.status || t.state || (isRefund ? "refunded" : "paid"),
          amount: Math.abs(amt),
          direction,
          currency: t.currency || "INR",
          bookingId: t.booking || t.bookingId || (t.booking?._id ?? "") , // CHANGED
          car:
            t.car ||
            t.booking?.car || {
              brand: t.booking?.brand,
              model: t.booking?.model,
              carnumber: t.booking?.carnumber,
            },
          note: t.note || t.description || "",
        };
      };

      const normalized = txs.map(mapRow);

      // Summary for renter
      const now = new Date();
      let monthSpent = 0;
      let lifetimeSpent = 0;
      let refundsReceived = 0;
      let pendingPayments = 0;

      for (const r of normalized) {
        const isThisMonth = (() => {
          const d = new Date(r.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })();
        if (r.direction === "debit") {
          lifetimeSpent += r.amount || 0;
          if (isThisMonth) monthSpent += r.amount || 0;
          if (["pending", "processing", "unpaid"].includes(String(r.status).toLowerCase())) {
            pendingPayments += r.amount || 0;
          }
        } else if (r.direction === "credit") {
          if (["refunded", "paid", "success"].includes(String(r.status).toLowerCase())) {
            refundsReceived += r.amount || 0;
          }
        }
      }

      setRows(normalized);
      setSummary({
        monthSpent,
        lifetimeSpent,
        refundsReceived,
        pendingPayments,
        lastUpdated: new Date().toISOString(),
      });
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filters
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs = to ? new Date(to).getTime() + 24 * 60 * 60 * 1000 - 1 : null;

    return rows.filter((r) => {
      const d = new Date(r.createdAt).getTime();
      if (fromTs && d < fromTs) return false;
      if (toTs && d > toTs) return false;
      if (type !== "all" && String(r.type).toLowerCase() !== type) return false;
      if (status !== "all" && String(r.status).toLowerCase() !== status) return false;

      if (!ql) return true;
      const carTitle = [r.car?.name, r.car?.brand, r.car?.model, r.car?.carnumber]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        String(r.id).toLowerCase().includes(ql) ||
        String(r.bookingId || "").toLowerCase().includes(ql) ||
        carTitle.includes(ql) ||
        String(r.note || "").toLowerCase().includes(ql)
      );
    });
  }, [rows, q, from, to, type, status]);

  // Paging (single source of truth)
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [q, from, to, type, status]);

  const clearFilters = () => {
    setQ("");
    setFrom("");
    setTo("");
    setType("all");
    setStatus("all");
  };

  const exportCsv = () => {
    const header = ["ID", "Date", "Type", "Status", "Direction", "Amount", "Currency", "BookingId", "Car", "Note"];
    const lines = [header.join(",")];
    filtered.forEach((r) => {
      const car = [r.car?.name, r.car?.brand, r.car?.model, r.car?.carnumber].filter(Boolean).join(" ");
      const row = [
        r.id,
        fmtDateTime(r.createdAt).replace(",", ""),
        r.type,
        r.status,
        r.direction,
        r.amount,
        r.currency || "INR",
        r.bookingId || "",
        car,
        (r.note || "").replace(/[\r\n,]+/g, " "),
      ];
      lines.push(row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `renter_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-2xl border p-4">
          <div className="text-sm text-gray-500">Spent This Month</div>
          <div className="mt-1 text-2xl font-bold text-[#2A1A3B]">₹{fmtINR(summary.monthSpent)}</div>
          <div className="mt-2 flex items-center gap-2 text-rose-700">
            <MdTrendingDown /> Active trips
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <div className="text-sm text-gray-500">Lifetime Spent</div>
          <div className="mt-1 text-2xl font-bold text-[#2A1A3B]">₹{fmtINR(summary.lifetimeSpent)}</div>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <div className="text-sm text-gray-500">Refunds Received</div>
          <div className="mt-1 text-2xl font-bold text-[#2A1A3B]">₹{fmtINR(summary.refundsReceived)}</div>
          <div className="mt-2 flex items-center gap-2 text-emerald-700">
            <MdTrendingUp /> Money back
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <div className="text-sm text-gray-500">Pending Payments</div>
          <div className="mt-1 text-2xl font-bold text-[#2A1A3B]">₹{fmtINR(summary.pendingPayments)}</div>
          <div className="mt-1 text-xs text-gray-500">
            {summary.lastUpdated ? `Updated ${fmtDateTime(summary.lastUpdated)}` : ""}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="col-span-1 lg:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search ID, booking, car, note"
                className="w-full pl-9 pr-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded-lg px-3 py-2">
              <option value="all">All Types</option>
              <option value="booking">Booking</option>
              <option value="cancel">Cancel</option>
              <option value="charges">Charges</option>
            </select>
          </div>
          <div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2">
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={fetchData} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
            <FiRefreshCw /> Refresh
          </button>
          <button onClick={clearFilters} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
            <FiFilter /> Clear Filters
          </button>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2f1c53] hover:bg-[#3d3356] text-white">
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Table/List */}
      <div className="bg-white rounded-2xl border p-0">
        {loading ? (
          <div className="p-6 text-gray-600">Loading...</div>
        ) : err ? (
          <div className="p-6 text-red-600">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-600">No transactions found.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-500 font-semibold border-b">
                    <th className="py-2 px-3 text-left">ID</th>
                    <th className="py-2 px-3 text-left">Date</th>
                    <th className="py-2 px-3 text-left">Type</th>
                    <th className="py-2 px-3 text-left">Status</th>
                    <th className="py-2 px-3 text-left">Booking</th>
                    <th className="py-2 px-3 text-left">Car</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => {
                    const carTitle = [r.car?.name, r.car?.brand, r.car?.model, r.car?.carnumber]
                      .filter(Boolean)
                      .join(" ");
                    const isCredit = r.direction === "credit";
                    return (
                      <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 font-mono text-xs">{r.id}</td>
                        <td className="py-2 px-3">{fmtDateTime(r.createdAt)}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded ${typeBadge(r.type)}`}>{String(r.type).toUpperCase()}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded ${statusBadge(r.status)}`}>{String(r.status).toUpperCase()}</span>
                        </td>
                        <td className="py-2 px-3">{r.bookingId ? <span className="px-2 py-1 rounded bg-gray-100 border text-gray-700">{r.bookingId}</span> : "-"}</td>
                        <td className="py-2 px-3">{carTitle || "-"}</td>
                        <td className="py-2 px-3 text-right font-semibold">
                          <span className={isCredit ? "text-emerald-700" : "text-rose-600"}>
                            {isCredit ? "+" : "-"}₹{fmtINR(r.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden divide-y">
              {pageRows.map((r) => {
                const isCredit = r.direction === "credit";
                const carTitle = [r.car?.name, r.car?.brand, r.car?.model, r.car?.carnumber]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div key={r.id} className="w-full text-left p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs">{r.id}</div>
                      <div className={`text-sm font-semibold ${isCredit ? "text-emerald-700" : "text-rose-600"}`}>
                        {isCredit ? "+" : "-"}₹{fmtINR(r.amount)}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">{fmtDateTime(r.createdAt)}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded ${typeBadge(r.type)}`}>{String(r.type).toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded ${statusBadge(r.status)}`}>{String(r.status).toUpperCase()}</span>
                    </div>
                    {carTitle ? <div className="mt-1 text-xs text-gray-700">{carTitle}</div> : null}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50 rounded-b-2xl">
              <div className="text-sm text-gray-600">Page {page} of {totalPages} • {filtered.length} records</div>
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded border bg-white disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <FiChevronLeft /> Prev
                </button>
                <button
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded border bg-white disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Receipt hint */}
      <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
        <MdReceiptLong className="text-[#2f1c53]" />
        Need a receipt? Select a transaction to download in your bookings page.
      </div>
    </div>
  );
}

export default RenterTransactions;