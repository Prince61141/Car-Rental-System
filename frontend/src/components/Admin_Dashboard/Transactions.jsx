import React, { useEffect, useState } from "react";
import { getTransactions, setTransactionStatus } from "../../utils/adminApi";

const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "-" : d.toLocaleString();
  } catch {
    return "-";
  }
};

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

const STATUSES = ["paid", "pending", "processing", "failed", "refunded"];

export default function AdminTransactions() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [party, setParty] = useState(""); // "", "renter", "owner"
  const [effect, setEffect] = useState(""); // "", "debit", "credit"
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [menuFor, setMenuFor] = useState(null); // transaction id for open dropdown
  const [updatingId, setUpdatingId] = useState(null);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const data = await getTransactions({ page: p, limit, status, type, party, effect });
      if (data?.success) {
        setItems(data.items || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type, party, effect]);

  const roleLabel = (r) => (r ? r.charAt(0).toUpperCase() + r.slice(1) : "-");

  const badgeByStatus = (s) => {
    const k = String(s || "").toLowerCase();
    if (k === "paid") return "bg-emerald-100 text-emerald-700";
    if (k === "pending") return "bg-amber-100 text-amber-800";
    if (k === "processing") return "bg-blue-100 text-blue-700";
    if (k === "failed") return "bg-rose-100 text-rose-700";
    if (k === "refunded") return "bg-gray-200 text-gray-700";
    return "bg-gray-100 text-gray-700";
  };

  const changeStatus = async (id, next) => {
    try {
      setUpdatingId(id);
      const res = await setTransactionStatus(id, next);
      if (res?.success) {
        setMenuFor(null);
        load();
      } else {
        alert(res?.message || "Failed to update");
      }
    } catch (e) {
      alert(e.message || "Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  // Global click-outside closer for dropdown
  useEffect(() => {
    if (!menuFor) return;
    const close = (e) => {
      // Close only if clicking outside any dropdown container
      if (!(e.target.closest && e.target.closest("[data-dd=txn-status-dd]"))) {
        setMenuFor(null);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuFor]);

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <label className="text-sm">Status:</label>
        <select className="border rounded px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <label className="text-sm">Type:</label>
        <select className="border rounded px-2 py-1 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All</option>
          <option value="booking">Booking</option>
          <option value="charges">Charges</option>
          <option value="cancel">Cancel</option>
          <option value="payout">Payout</option>
          <option value="refund">Refund</option>
        </select>

        <label className="text-sm">Party:</label>
        <select className="border rounded px-2 py-1 text-sm" value={party} onChange={(e) => setParty(e.target.value)}>
          <option value="">All</option>
          <option value="renter">Renter</option>
          <option value="owner">Owner</option>
        </select>

        <label className="text-sm">Effect:</label>
        <select className="border rounded px-2 py-1 text-sm" value={effect} onChange={(e) => setEffect(e.target.value)}>
          <option value="">All</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>

        <button className="ml-auto px-3 py-1 rounded bg-gray-200" onClick={() => load()} disabled={loading}>
          Refresh
        </button>
      </div>

      <div className="border rounded overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Transaction</th>
              <th className="text-left p-2">Party</th>
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">Car</th>
              <th className="text-left p-2">Amount</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => {
              // Party/effect (fallback if backend doesn't compute)
              const partyKey = t.computed?.party || (t.renter ? "renter" : "owner");
              const eff = t.computed?.effect || t.direction || "-";
              const isCredit = eff === "credit";

              // User to display
              const user =
                t.computed?.displayUser ||
                (partyKey === "renter" ? t.renter : t.owner) ||
                t.user ||
                t.booking?.user ||
                t.booking?.renter ||
                {};

              // Car info (prefer populated objects; fallback to id string)
              const bookingCar = t.booking?.car;
              const txnCar = t.car;
              const carObj =
                (bookingCar && typeof bookingCar === "object" ? bookingCar : null) ||
                (txnCar && typeof txnCar === "object" ? txnCar : null) ||
                null;

              const carTitle = carObj
                ? [carObj.brand || carObj.make, carObj.model || carObj.name].filter(Boolean).join(" ") ||
                  carObj.name ||
                  "-"
                : typeof bookingCar === "string"
                ? bookingCar
                : typeof txnCar === "string"
                ? txnCar
                : "-";

              const carNumber =
                (carObj && (carObj.carnumber || carObj.registrationNumber || carObj.numberPlate || carObj.plate || carObj.reg)) ||
                "-";

              return (
                <tr key={t._id} className="border-t">
                  <td className="p-2">
                    <div className="font-mono text-xs">{t._id}</div>
                    <div className="text-xs text-gray-500">{t.type || "-"}</div>
                    <div className="text-xs text-gray-500">{fmtDate(t.createdAt)}</div>
                  </td>

                  <td className="p-2">
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] rounded ${
                        isCredit ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {partyKey === "renter" ? "Renter" : "Owner"} • {isCredit ? "Credit" : "Debit"}
                    </span>
                  </td>

                  <td className="p-2">
                    <div className="font-medium">
                      {user.fullName || user.name || user.username || "-"}
                      {user.role ? (
                        <span className="ml-1 text-[11px] text-gray-600">({roleLabel(user.role)})</span>
                      ) : null}
                    </div>
                    <div className="text-xs text-gray-500">{user.email || "-"}</div>
                  </td>

                  <td className="p-2">
                    <div className="text-xs">{carTitle}</div>
                    <div className="text-xs text-gray-500">{carNumber || "-"}</div>
                  </td>

                  <td className="p-2 font-semibold">
                    <span className={isCredit ? "text-emerald-700" : "text-rose-700"}>
                      {isCredit ? "+" : "-"}
                      {fmtINR(t.amount)}
                    </span>
                  </td>

                  <td className="p-2 capitalize">
                    <span className={`inline-block px-2 py-0.5 text-[11px] rounded ${badgeByStatus(t.status)}`}>
                      {t.status || "-"}
                    </span>
                  </td>

                  <td className="p-2 relative">
                    <button
                      className="px-2 py-1 rounded bg-indigo-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent immediate close
                        setMenuFor((m) => (m === t._id ? null : t._id));
                      }}
                    >
                      {updatingId === t._id ? "Saving..." : "Update"}
                    </button>

                    {menuFor === t._id && (
                      <div
                        data-dd="txn-status-dd"
                        className="absolute z-50 right-0 mt-1 w-40 bg-white border rounded shadow-lg p-1"
                      >
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 ${
                              t.status === s ? "font-semibold" : ""
                            }`}
                            onClick={() => changeStatus(t._id, s)}
                            disabled={updatingId === t._id}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {!items.length && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm text-gray-500">
                  {loading ? "Loading..." : "No transactions"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <div>
          Page {page}, showing {items.length} of {total}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => load(page - 1)}
          >
            Prev
          </button>
          <button
            disabled={page * limit >= total}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => load(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}