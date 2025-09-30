import React, { useEffect, useMemo, useState } from "react";
import {
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { MdTrendingUp, MdTrendingDown, MdPayments } from "react-icons/md";

const decodeJwtOwnerId = (token) => {
  try {
    const part = token.split(".")[1];
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const payload = JSON.parse(json);
    return payload.ownerId || payload.id || payload._id || payload.userId || payload.sub || null;
  } catch {
    return null;
  }
};
const getOwnerId = async (headers) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const ls = localStorage.getItem("ownerId");
  if (ls) return ls;

  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  const fromJwt = token ? decodeJwtOwnerId(token) : null;
  if (fromJwt) {
    return fromJwt;
  }

  try {
    const res = await fetch(`${API_URL}/api/owners/me`, { headers });
    if (res.ok) {
      const data = await res.json();
      const id =
        data?.user?._id || data?._id || data?.id || data?.user?.id || null;
      if (id) {
        return id;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

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
  if (key === "paid" || key === "success")
    return "bg-green-100 text-green-700 border border-green-200";
  if (key === "pending" || key === "processing")
    return "bg-amber-100 text-amber-800 border border-amber-200";
  if (key === "failed" || key === "declined")
    return "bg-red-100 text-red-700 border border-red-200";
  if (key === "refunded" || key === "refund")
    return "bg-blue-100 text-blue-700 border border-blue-200";
  return "bg-gray-100 text-gray-700 border border-gray-200";
};

const typeBadge = (t) => {
  const key = String(t || "").toLowerCase();
  if (key === "booking" || key === "earning")
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (key === "payout" || key === "withdrawal")
    return "bg-violet-50 text-violet-700 border border-violet-200";
  if (key === "fee" || key === "charge")
    return "bg-slate-50 text-slate-700 border border-slate-200";
  if (key === "refund")
    return "bg-blue-50 text-blue-700 border border-blue-200";
  return "bg-gray-50 text-gray-700 border border-gray-200";
};

function Transactions() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    pendingPayout: 0,
    monthEarnings: 0,
    lifetimeEarnings: 0,
    lastUpdated: null,
  });

  // Filters
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  // Paging
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [openId, setOpenId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const ownerId = await getOwnerId(headers);
      if (!ownerId) {
        setErr("Owner ID not found. Please re-login.");
        setRows([]);
        setSummary((s) => ({ ...s, lastUpdated: new Date().toISOString() }));
        setLoading(false);
        return;
      }
      const hdrs = {
        ...headers,
        "x-owner-id": ownerId,
      };

      const endpoints = [
        `${API_URL}/api/transactions/owner?ownerId=${encodeURIComponent(ownerId)}`,
        `${API_URL}/api/owners/transactions?ownerId=${encodeURIComponent(ownerId)}`,
      ];

      let okRes = null;
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { headers: hdrs });
          if (res.ok) {
            okRes = await res.json();
            break;
          }
        } catch {
        }
      }

      if (!okRes) throw new Error("Failed to load transactions");

      const txs = Array.isArray(okRes.data)
        ? okRes.data
        : Array.isArray(okRes.transactions)
        ? okRes.transactions
        : Array.isArray(okRes)
        ? okRes
        : [];

      const mapRow = (t) => {
        const amt =
          typeof t.amount === "number" ? t.amount : Number(t.amount || t.total || 0);

        // NEW: robust booking id extraction (ObjectId, string, or nested)
        const rawBookingId =
          t.bookingId ||
          (t.booking && (typeof t.booking === "string" ? t.booking : t.booking?._id || t.booking?.id)) ||
          t.bookingRef ||
          t.booking_id;
        const bookingId = rawBookingId ? String(rawBookingId) : null;

        const sign =
          String(t.type || "").toLowerCase() === "payout" ||
          String(t.direction || "").toLowerCase() === "debit" ||
          amt < 0
            ? -1
            : 1;

        return {
          id: t._id || t.id || t.reference || t.txnId || Math.random().toString(36).slice(2),
          createdAt: t.createdAt || t.date || t.time || new Date().toISOString(),
          type: t.type || (amt >= 0 ? "booking" : "payout"),
          status: t.status || t.state || "paid",
          amount: Math.abs(amt),
          direction: sign >= 0 ? "credit" : "debit",
          currency: t.currency || "INR",
          bookingId, // <-- fixed
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

      const paidCredits = normalized
        .filter(
          (r) =>
            r.direction === "credit" &&
            ["paid", "success"].includes(String(r.status).toLowerCase())
        )
        .reduce((s, r) => s + (r.amount || 0), 0);

      const pendingPayout = normalized
        .filter(
          (r) =>
            ["payout", "withdrawal"].includes(String(r.type).toLowerCase()) &&
            ["pending", "processing"].includes(String(r.status).toLowerCase())
        )
        .reduce((s, r) => s + (r.amount || 0), 0);

      const now = new Date();
      const monthEarnings = normalized
        .filter((r) => {
          const d = new Date(r.createdAt);
          return (
            r.direction === "credit" &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        })
        .reduce((s, r) => s + (r.amount || 0), 0);

      setRows(normalized);
      setSummary({
        balance:
          okRes.balance ??
          okRes.wallet?.balance ??
          Math.max(0, paidCredits - pendingPayout),
        pendingPayout:
          okRes.pendingPayout ?? okRes.wallet?.pending ?? pendingPayout,
        monthEarnings:
          okRes.monthEarnings ?? okRes.stats?.month ?? monthEarnings,
        lifetimeEarnings:
          okRes.lifetimeEarnings ??
          okRes.stats?.lifetime ??
          paidCredits,
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

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs = to ? new Date(to).getTime() + 24 * 60 * 60 * 1000 - 1 : null;

    return rows.filter((r) => {
      const d = new Date(r.createdAt).getTime();
      if (fromTs && d < fromTs) return false;
      if (toTs && d > toTs) return false;

      if (type !== "all" && String(r.type).toLowerCase() !== type) return false;
      if (status !== "all" && String(r.status).toLowerCase() !== status)
        return false;

      if (!ql) return true;
      const carTitle = [
        r.car?.name,
        r.car?.carnumber,
      ]
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [q, from, to, type, status]);

  const clearFilters = () => {
    setQ("");
    setFrom("");
    setTo("");
    setType("all");
    setStatus("all");
  };

  const exportCsv = () => {
    const header = [
      "ID",
      "Date",
      "Type",
      "Status",
      "Direction",
      "Amount",
      "Currency",
      "BookingId",
      "Car",
      "Note",
    ];
    const lines = [header.join(",")];
    filtered.forEach((r) => {
      const car = [
        r.car?.name,
        r.car?.carnumber,
      ]
        .filter(Boolean)
        .join(" ");
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
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selected = useMemo(
    () => rows.find((r) => String(r.id) === String(openId)),
    [openId, rows]
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-2xl border p-4">
          <div className="text-sm text-gray-500">Wallet Balance</div>
          <div className="mt-1 text-2xl font-bold text-[#2A1A3B]">
            ₹{fmtINR(summary.balance)}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {summary.lastUpdated ? `Updated ${fmtDateTime(summary.lastUpdated)}` : ""}
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <div className="text-sm text-gray-500">Pending Payout</div>
          <div className="mt-1 text-2xl font-bold text-[#2A1A3B]">
            ₹{fmtINR(summary.pendingPayout)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-emerald-700">
            <MdTrendingUp /> Processing soon
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <div className="text-sm text-gray-500">This Month</div>
          <div className="mt-1 text-2xl font-bold text-[#2A1A3B]">
            ₹{fmtINR(summary.monthEarnings)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-emerald-700">
            <MdTrendingUp /> On track
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <div className="text-sm text-gray-500">Lifetime Earnings</div>
          <div className="mt-1 text-2xl font-bold text-[#2A1A3B]">
            ₹{fmtINR(summary.lifetimeEarnings)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-rose-700">
            <MdTrendingDown /> Fees included
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
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="booking">Booking</option>
              <option value="payout">Payout</option>
              <option value="refund">Refund</option>
              <option value="fee">Fee</option>
            </select>
          </div>
            <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50"
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50"
          >
            <FiFilter /> Clear Filters
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2f1c53] hover:bg-[#3d3356] text-white"
          >
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
                    const carTitle = [
                      r.car?.name,
                      r.car?.carnumber,
                    ]
                      .filter(Boolean)
                      .join(" ");
                    const isCredit = r.direction === "credit";
                    return (
                      <tr
                        key={r.id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => setOpenId(r.id)}
                        id={`txn-${r.id}`}
                      >
                        <td className="py-2 px-3 font-mono text-xs">{r.id}</td>
                        <td className="py-2 px-3">{fmtDateTime(r.createdAt)}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded ${typeBadge(r.type)}`}>
                            {String(r.type).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded ${statusBadge(r.status)}`}>
                            {String(r.status).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {r.bookingId ? (
                            <span className="px-2 py-1 rounded bg-gray-100 border text-gray-700">
                              {r.bookingId}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-2 px-3">{carTitle || "-"}</td>
                        <td className="py-2 px-3 text-right font-semibold">
                          <span className={isCredit ? "text-green-700" : "text-red-600"}>
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
                const carTitle = [
                  r.car?.name,
                  r.car?.carnumber,
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={r.id}
                    className="w-full text-left p-3 hover:bg-gray-50"
                    onClick={() => setOpenId(r.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs">{r.id}</div>
                      <div
                        className={`text-sm font-semibold ${
                          isCredit ? "text-green-700" : "text-red-600"
                        }`}
                      >
                        {isCredit ? "+" : "-"}₹{fmtINR(r.amount)}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {fmtDateTime(r.createdAt)}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded ${typeBadge(r.type)}`}>
                        {String(r.type).toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${statusBadge(r.status)}`}>
                        {String(r.status).toUpperCase()}
                      </span>
                    </div>
                    {carTitle ? (
                      <div className="mt-1 text-xs text-gray-700">{carTitle}</div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50 rounded-b-2xl">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages} • {filtered.length} records
              </div>
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

      {/* Details drawer */}
      {openId && selected && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenId(null)}
          />
          <div className="absolute right-0 top-0 h-full w-[92vw] sm:w-[480px] bg-white shadow-2xl">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-semibold text-[#2A1A3B]">Transaction Details</div>
              <button
                className="px-2 py-1 rounded hover:bg-gray-100"
                onClick={() => setOpenId(null)}
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 border rounded-lg p-2">
                  <div className="text-gray-500">ID</div>
                  <div className="font-mono text-xs">{selected.id}</div>
                </div>
                <div className="bg-gray-50 border rounded-lg p-2">
                  <div className="text-gray-500">Date</div>
                  <div>{fmtDateTime(selected.createdAt)}</div>
                </div>
                <div className="bg-gray-50 border rounded-lg p-2">
                  <div className="text-gray-500">Type</div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded ${typeBadge(selected.type)}`}>
                      {String(selected.type).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 border rounded-lg p-2">
                  <div className="text-gray-500">Status</div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded ${statusBadge(selected.status)}`}>
                      {String(selected.status).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 border rounded-lg p-2">
                  <div className="text-gray-500">Direction</div>
                  <div className="flex items-center gap-2">
                    {selected.direction === "credit" ? (
                      <MdTrendingUp className="text-emerald-600" />
                    ) : (
                      <MdTrendingDown className="text-red-600" />
                    )}
                    {selected.direction}
                  </div>
                </div>
                <div className="bg-gray-50 border rounded-lg p-2">
                  <div className="text-gray-500">Amount</div>
                  <div className="text-lg font-bold text-[#2A1A3B]">
                    {selected.direction === "credit" ? "+" : "-"}₹{fmtINR(selected.amount)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border rounded-lg p-2">
                <div className="text-gray-500">Booking</div>
                <div className="mt-1">
                  {selected.bookingId ? (
                    <span className="px-2 py-1 rounded bg-gray-100 border text-gray-700">
                      {selected.bookingId}
                    </span>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border rounded-lg p-2">
                <div className="text-gray-500">Car</div>
                <div className="mt-1">
                  {[
                    selected.car?.name,
                    selected.car?.carnumber,
                  ]
                    .filter(Boolean)
                    .join(" ") || "-"}
                </div>
              </div>

              {selected.note ? (
                <div className="bg-gray-50 border rounded-lg p-2">
                  <div className="text-gray-500">Note</div>
                  <div className="mt-1">{selected.note}</div>
                </div>
              ) : null}

              <div className="pt-2">
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2f1c53] hover:bg-[#3d3356] text-white"
                  onClick={() => {
                    alert("Receipt coming soon");
                  }}
                >
                  <MdPayments /> Download receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;