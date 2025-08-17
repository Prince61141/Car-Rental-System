import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

function formatDateTime(iso) {
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
}

function diffHours(a, b) {
  try {
    const ms = new Date(b).getTime() - new Date(a).getTime();
    return Math.max(0, ms / (1000 * 60 * 60));
  } catch {
    return 0;
  }
}

const statusStyles = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

function Booking({ openId = null, onOpened }) {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [mapData, setMapData] = useState({
    title: "",
    lat: null,
    lng: null,
    address: "",
    ownerName: "",
    ownerPhone: "",
    carNumber: "",
    fuelType: "",
    confirmed: false,
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [highlightId, setHighlightId] = useState(null);

  const scrollToBooking = (id) => {
    if (!id) return;
    const el = document.getElementById(`booking-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightId(String(id));
      setTimeout(() => setHighlightId(null), 2000);
    }
  };

  const token = useMemo(() => {
    const t =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    return t ? t.replace(/^"+|"+$/g, "") : "";
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login", {
        state: { next: location.pathname + location.search },
      });
      return;
    }
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:5000/api/bookings?scope=me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load bookings");
        const list = Array.isArray(data.bookings) ? data.bookings : [];
        setBookings(list);
      } catch (e) {
        setError(e.message || "Failed to load bookings");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, navigate, location]);

  useEffect(() => {
    if (!openId) return;
    if (!Array.isArray(bookings) || bookings.length === 0) return;
    scrollToBooking(openId);
    onOpened && onOpened();
  }, [openId, bookings]);

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) scrollToBooking(openId);
  }, [searchParams, bookings]);

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancel failed");
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b))
      );
    } catch (e) {
      alert(e.message || "Cancel failed");
    }
  };

  const openMap = (b) => {
    const car = b?.car || {};
    const owner = b?.owner || b?.car?.owner || {};
    const loc = car?.location || {};
    const fuelType = car?.fuelType || "";
    const address = [loc.area, loc.city, loc.state].filter(Boolean).join(", ");
    const fulladdress = [loc.addressLine, loc.area, loc.city, loc.state]
      .filter(Boolean)
      .join(", ");

    setMapData({
      title: car?.name || [car?.brand, car?.model].filter(Boolean).join(" "),
      lat: loc.lat ?? null,
      lng: loc.lng ?? null,
      fuelType,
      address,
      fulladdress,
      ownerName: owner.fullName || owner.name || owner.username || "",
      ownerPhone: owner.phone || "",
      carNumber: car.carnumber || car.carNumber || "",
      confirmed: b?.status === "confirmed",
    });
    setMapOpen(true);
  };

  const MapModal = () => {
    if (!mapOpen) return null;
    const {
      title,
      lat,
      lng,
      address,
      fulladdress,
      ownerName,
      ownerPhone,
      carNumber,
      fuelType,
      confirmed,
    } = mapData;
    const zoom = 14;
    const src =
      lat != null && lng != null
        ? `https://maps.google.com/maps?ll=${lat},${lng}&z=${zoom}&t=m&output=embed`
        : `https://maps.google.com/maps?q=${encodeURIComponent(
            address || title || "Pickup"
          )}&z=${zoom}&t=m&output=embed&iwloc=0`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center mb-4">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMapOpen(false)}
        />
        <div className="relative bg-white rounded-2xl shadow-xl w-[92vw] max-w-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-[#2A1A3B]">Pickup Details</h3>
            <button
              onClick={() => setMapOpen(false)}
              className="px-2 py-1 rounded hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="p-4">
            {/* Show sensitive details only for confirmed bookings */}
            {confirmed ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                {ownerName ? (
                  <div className="bg-gray-50 border rounded-lg p-2">
                    <span className="text-gray-500">Owner:</span> {ownerName}
                  </div>
                ) : null}
                {ownerPhone ? (
                  <div className="bg-gray-50 border rounded-lg p-2">
                    <span className="text-gray-500">Owner Phone:</span>{" "}
                    <a
                      href={`tel:${ownerPhone}`}
                      className="text-[#2A1A3B] hover:underline"
                    >
                      {ownerPhone}
                      </a>
                    </div>
                ) : null}
                {carNumber ? (
                  <div className="bg-gray-50 border rounded-lg p-2">
                    <span className="text-gray-500">Car No:</span> {carNumber}
                  </div>
                ) : null}
                {fuelType ? (
                  <div className="bg-gray-50 border rounded-lg p-2">
                    <span className="text-gray-500">Fuel Type:</span> {fuelType}
                  </div>
                ) : null}
                {fulladdress ? (
                  <div className="bg-gray-50 border rounded-lg p-2 sm:col-span-2">
                    <span className="text-gray-500">Pickup Area:</span>{" "}
                    {fulladdress}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mb-4 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                Booking not confirmed yet. Details will be available after
                confirmation.
              </div>
            )}

            <div className="rounded-xl overflow-hidden border">
              <iframe
                title={title || "Pickup"}
                src={src}
                width="100%"
                height="360"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            {lat != null && lng != null ? (
              <div className="mt-2 text-xs text-gray-500">
                Coords: {lat}, {lng}
              </div>
            ) : null}
          </div>

          <div className="px-4 py-3 border-t flex justify-end gap-2">
            <a
              className="px-4 py-2 rounded-lg bg-[#2A1A3B] text-white font-semibold hover:bg-[#1c1128]"
              target="_blank"
              rel="noreferrer"
              href={
                lat != null && lng != null
                  ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      address || title
                    )}`
              }
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    );
  };

  const Card = ({ b }) => {
    const car = b.car || {};
    const owner = b.owner || b.car?.owner || {};
    const ownerName = owner.fullName || owner.name || owner.username || "";
    const ownerPhone = owner.phone || "";
    const img = car.images?.[0] || car.image || "/placeholder-car.jpg";
    const title =
      car.name || [car.brand, car.model].filter(Boolean).join(" ") || "Car";
    const durationHrs = diffHours(b.pickupAt, b.dropoffAt);
    const days = Math.floor(durationHrs / 24);
    const hours = Math.round(durationHrs % 24);
    const statusClass =
      statusStyles[(b.status || "").toLowerCase()] ||
      "bg-gray-100 text-gray-700";
    const canCancel =
      b.status === "confirmed" && new Date() < new Date(b.pickupAt);

    const challanAmount = Number(b?.completion?.challanAmount || 0);
    const fastagAmount = Number(b?.completion?.fastagAmount || 0);
    const approval = (b?.completion?.approval || "pending").toLowerCase();
    const showCharges = String(b.status || "").toLowerCase() === "completed";

    // NEW: late fee/time
    const lateMinutes = Number(b?.completion?.lateMinutes || 0);
    const lateHours =
      Number(b?.completion?.lateHours) ||
      (lateMinutes > 0 ? Math.ceil(lateMinutes / 60) : 0);
    const lateFee = Number(b?.completion?.lateFee || 0);

    return (
      <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-[30%] h-auto sm:h-auto bg-gray-100 shrink-0">
            <img src={img} alt={title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#2A1A3B]">
                  {title}
                </h3>
                {car.location?.city || car.location?.state ? (
                  <p className="text-sm text-gray-500">
                    {[car.location?.city, car.location?.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : null}
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}
              >
                {b.status?.toUpperCase() || "STATUS"}
              </span>
            </div>

            {/* Car and owner details (visible especially for confirmed) */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs sm:text-sm">
              {car.location?.area ||
              car.location?.city ||
              car.location?.state ? (
                <div className="bg-gray-50 border rounded-lg p-2 col-span-1 lg:col-span-2">
                  <span className="text-gray-500">Pickup Area:</span>{" "}
                  {[car.location?.area, car.location?.city, car.location?.state]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              ) : null}
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-[#f7f6fa] rounded-lg p-3">
                <div className="text-gray-500">Pickup</div>
                <div className="font-medium">{formatDateTime(b.pickupAt)}</div>
              </div>
              <div className="bg-[#f7f6fa] rounded-lg p-3">
                <div className="text-gray-500">Dropoff</div>
                <div className="font-medium">{formatDateTime(b.dropoffAt)}</div>
              </div>
              <div className="bg-[#f7f6fa] rounded-lg p-3">
                <div className="text-gray-500">Duration</div>
                <div className="font-medium">
                  {days > 0 ? `${days}d` : ""} {hours}h
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm">
                <div className="text-gray-500">Total Paid/Payable</div>
                <div className="text-xl font-bold text-[#2A1A3B]">
                  ₹{b.totalAmount}
                </div>
                {b.payment?.status ? (
                  <div className="text-xs text-gray-500">
                    Payment: {b.payment.status}
                  </div>
                ) : null}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/rent/${car._id || car.id || ""}`)}
                  className="px-4 py-2 rounded-lg border font-semibold hover:bg-gray-50"
                >
                  View Car
                </button>

                {b.status === "confirmed" &&
                car.location &&
                (car.location.lat != null ||
                  car.location.city ||
                  car.location.area) ? (
                  <button
                    onClick={() => openMap(b)}
                    className="px-4 py-2 rounded-lg font-semibold bg-[#2A1A3B] text-white hover:bg-[#1c1128]"
                  >
                    Show Pickup Location
                  </button>
                ) : null}

                {canCancel ? (
                  <button
                    onClick={() => cancelBooking(b._id)}
                    className="px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>

            {showCharges && (
              <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-indigo-900">
                    Additional charges
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      approval === "approved"
                        ? "bg-green-100 text-green-700"
                        : approval === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    Approval: {approval.charAt(0).toUpperCase() + approval.slice(1)}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white/70 rounded border border-indigo-100 p-2">
                    <span className="text-gray-600">Challan charges: </span>
                    <span className="font-semibold">₹{challanAmount.toFixed(0)}</span>
                  </div>
                  <div className="bg-white/70 rounded border border-indigo-100 p-2">
                    <span className="text-gray-600">FASTag/Toll: </span>
                    <span className="font-semibold">₹{fastagAmount.toFixed(0)}</span>
                  </div>
                  <div className="bg-white/70 rounded border border-indigo-100 p-2">
                    <span className="text-gray-600">Late fee: </span>
                    <span className="font-semibold">₹{(lateFee || 0).toFixed(0)}</span>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white/70 rounded border border-indigo-100 p-2">
                    <span className="text-gray-600">Late time: </span>
                    <span className="font-semibold">
                      {lateMinutes > 0 ? `${lateMinutes} min (${lateHours} hr)` : "On time"}
                    </span>
                  </div>
                  
                {b?.completion?.notes ? (
                  <div className="mt-2 text-xs text-gray-600">Note: {b.completion.notes}</div>
                ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A1A3B]">
            My Bookings
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            View your upcoming and past car rentals with full details.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border rounded-2xl bg-white p-4 animate-pulse"
              >
                <div className="h-40 bg-gray-200 rounded-xl mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="border rounded-2xl bg-white p-8 text-center">
            <h3 className="text-lg font-semibold text-[#2A1A3B]">
              No bookings yet
            </h3>
            <p className="text-gray-600 mt-1">
              When you book a car, it will appear here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-5 py-2 rounded-lg bg-[#2A1A3B] text-white font-semibold hover:bg-[#1c1128]"
            >
              Explore Cars
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {bookings.map((b) => (
              <div
                key={b._id}
                id={`booking-${b._id}`} // NEW: anchor for auto-scroll
                className={
                  highlightId === String(b._id)
                    ? "ring-2 ring-[#2A1A3B] rounded-2xl"
                    : undefined
                } // NEW: visual cue
              >
                <Card b={b} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map modal */}
      <MapModal />
    </div>
  );
}

export default Booking;