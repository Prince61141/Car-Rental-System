import React, { useEffect, useState } from "react";

function Notifications() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/owners/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#f7f7fa] py-8 px-2 md:px-8">
      <div className="mx-auto space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500">No notifications.</div>
        ) : (
          // Sort notifications by createdAt descending (newest first)
          [...notifications]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((n) => (
              <div
                key={n._id}
                className="flex items-start gap-4 bg-white rounded-xl shadow-sm px-5 py-4"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold text-[#2F2240] bg-[#f7f6fa]">
                    {n.status === "Confirmed" ? (
                      <span>✔</span>
                    ) : n.status === "Completed" ? (
                      <span>✓</span>
                    ) : n.status === "Cancelled" ? (
                      <span>✖</span>
                    ) : n.status === "Reminder" ? (
                      <span>!</span>
                    ) : (
                      <span>B</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-base">
                    {n.status === "Confirmed"
                      ? "Booking Confirmed"
                      : n.status === "Completed"
                      ? "Booking Completed"
                      : n.status === "cancelled"
                      ? "Booking Cancelled"
                      : n.status === "Reminder"
                      ? "Please Complete Booking"
                      : "Booking Request"}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {n.status === "Confirmed"
                      ? `Your car booking for ${n.car?.brand} ${n.car?.model} with ${n.user?.name || "a renter"} has been confirmed.`
                      : n.status === "Completed"
                      ? `Booking for ${n.car?.brand} ${n.car?.model} with ${n.user?.name || "a renter"} is completed.`
                      : n.status === "cancelled"
                      ? `Booking for ${n.car?.brand} ${n.car?.model} with ${n.user?.name || "a renter"} has been cancelled.`
                      : n.status === "Reminder"
                      ? n.message ||
                        `Booking for ${n.car?.brand} ${n.car?.model} with ${n.user?.name || "a renter"} ended. Please complete or cancel the booking.`
                      : `You received a new booking request for ${n.car?.brand} ${n.car?.model} from ${n.user?.name || "a renter"}.`}
                    {n.to && n.status !== "Completed" && n.status !== "Cancelled" && (
                      <span>
                        {" "}
                        (Rental ends on {new Date(n.to).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default Notifications;