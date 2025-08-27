import React, { useEffect, useState } from "react";
import { getCompletedBookings, setCompletionApproval } from "../../utils/adminApi";

const fmt = (iso) => {
  try {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "-" : d.toLocaleString();
  } catch {
    return "-";
  }
};

export default function CompletedBookings() {
  const [items, setItems] = useState([]);
  const [approval, setApproval] = useState("pending");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);

  const load = async (p = page, appr = approval) => {
    setLoading(true);
    try {
      const data = await getCompletedBookings({ page: p, limit, approval: appr });
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
    load(1, approval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approval]);

  const decide = async (id, decision) => {
    const note = window.prompt(`Add note for ${decision}?`, "") || "";
    const res = await setCompletionApproval(id, decision, note);
    if (res?.success) load();
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <label className="text-sm">Filter approval:</label>
        <select
          value={approval}
          onChange={(e) => setApproval(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
        <button
          className="ml-auto px-3 py-1 rounded bg-gray-200"
          onClick={() => load()}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Booking</th>
              <th className="text-left p-2">Car</th>
              <th className="text-left p-2">Renter</th>
              <th className="text-left p-2">Completed</th>
              <th className="text-left p-2">Charges</th>
              <th className="text-left p-2">Approval</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => {
              const car = b.car || {};
              const renter = b.user || {};
              const comp = b.completion || {};
              const charges =
                Number(comp.challanAmount || 0) +
                Number(comp.fastagAmount || 0) +
                Number(comp.lateFee || 0);
              return (
                <tr key={b._id} className="border-t">
                  <td className="p-2">
                    <div className="font-mono text-xs">{b._id}</div>
                    <div className="text-xs text-gray-500">Pickup: {fmt(b.pickupAt)}</div>
                    <div className="text-xs text-gray-500">Drop: {fmt(b.dropoffAt)}</div>
                  </td>
                  <td className="p-2">
                    <div className="font-medium">
                      {car.name || [car.brand, car.model].filter(Boolean).join(" ")}
                    </div>
                    <div className="text-xs text-gray-500">{car.carnumber || "-"}</div>
                  </td>
                  <td className="p-2">
                    <div className="font-medium">
                      {renter.fullName || renter.name || renter.username || "-"}
                    </div>
                    <div className="text-xs text-gray-500">{renter.email || "-"}</div>
                  </td>
                  <td className="p-2">{fmt(b.completedAt)}</td>
                  <td className="p-2">
                    <div className="text-xs">Challan: ₹{Number(comp.challanAmount || 0).toFixed(0)}</div>
                    <div className="text-xs">FASTag: ₹{Number(comp.fastagAmount || 0).toFixed(0)}</div>
                    <div className="text-xs">Late fee: ₹{Number(comp.lateFee || 0).toFixed(0)}</div>
                    <div className="text-xs font-semibold mt-1">
                      Total: ₹{charges.toFixed(0)}
                    </div>
                  </td>
                  <td className="p-2 capitalize">{comp.approval || "pending"}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 rounded bg-green-600 text-white"
                        onClick={() => decide(b._id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-red-600 text-white"
                        onClick={() => decide(b._id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!items.length && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm text-gray-500">
                  {loading ? "Loading..." : "No records"}
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
            onClick={() => load(page - 1, approval)}
          >
            Prev
          </button>
          <button
            disabled={page * 10 >= total}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => load(page + 1, approval)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}