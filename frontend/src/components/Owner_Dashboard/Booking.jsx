import React, { useEffect, useMemo, useState } from "react";
import { BsFilter } from "react-icons/bs";
import { MdDirectionsCar } from "react-icons/md";
import ListCar from "./ListCar";
import { FiPlus } from "react-icons/fi";

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

const addressOf = (loc = {}) =>
  [loc.area, loc.city, loc.state].filter(Boolean).join(", ");

function Booking({ ownerName }) {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [mapOpen, setMapOpen] = useState(false);
  const [mapData, setMapData] = useState({
    title: "",
    lat: null,
    lng: null,
    address: "",
  });

  const [carsCount, setCarsCount] = useState(0);
  const [loadingCars, setLoadingCars] = useState(true);
  const [showListCar, setShowListCar] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/cars/mycars", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data?.success) {
          setCarsCount((data.cars || []).length);
        }
      } finally {
        setLoadingCars(false);
      }
    };
    load();
  }, []);

  const token = useMemo(() => {
    const t =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    return t ? t.replace(/^"+|"+$/g, "") : "";
  }, []);

  const viewLicensePdf = async (booking) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/${booking._id}/renter-license`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "License not available");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
    } catch (e) {
      alert(e.message || "Failed to open license");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          "http://localhost:5000/api/bookings?scope=owner",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load bookings");
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } catch (e) {
        setError(e.message || "Failed to load bookings");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const openDetails = (b) => {
    setSelected(b);
    setDetailsOpen(true);
  };

  const openMap = (car) => {
    const loc = car?.location || {};
    const addr = addressOf(loc);
    const title =
      car?.name || [car?.brand, car?.model].filter(Boolean).join(" ");
    setMapData({
      title,
      lat: loc.lat ?? null,
      lng: loc.lng ?? null,
      address: addr || title,
    });
    setMapOpen(true);
  };

  return (
    <div>
      <div className="bg-white rounded-2xl border shadow-sm px-4 sm:px-6 py-4 m-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Welcome, {ownerName || "Owner"}!
              </h1>
              <p className="text-gray-600 text-sm">
                Keep up the great work! Your cars are helping people travel
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2">
              <button
                type="button"
                onClick={() => setShowListCar(true)}
                className="inline-flex items-center gap-2 bg-[#2f1c53] hover:bg-[#3d3356] text-white font-medium text-sm px-4 py-2 rounded-lg shadow transition"
              >
                <FiPlus size={18} />
                List A new Car
              </button>
              <div className="flex items-center text-sm text-gray-700">
                <MdDirectionsCar className="mr-2" size={18} />
                {loadingCars ? "Loading..." : `${carsCount} Active Listing`}
              </div>
            </div>
          </div>
        </div>

        {showListCar && (
          <ListCar
            onCarAdded={() => {}}
            onClose={() => setShowListCar(false)}
          />
        )}
      <div className="bg-white rounded-xl shadow p-6 mt-6 ml-3 mr-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Live Car Status</h2>
          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
            <BsFilter /> Filter
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 font-semibold border-b">
                  <th className="py-2 px-3 text-left">No.</th>
                  <th className="py-2 px-3 text-left">Car no.</th>
                  <th className="py-2 px-3 text-left">Car</th>
                  <th className="py-2 px-3 text-left">Renter</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Total</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, idx) => {
                  const car = b.car || {};
                  const renter = b.user || {};
                  const name =
                    renter.fullName || renter.name || renter.username || "-";
                  const phone = renter.mobile || renter.phone || "-";
                  const carNo = car.carnumber || "-";
                  const title =
                    car.name ||
                    [car.brand, car.model].filter(Boolean).join(" ");
                  const sKey = (b.status || "").toLowerCase();

                  return (
                    <tr
                      key={b._id || idx}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-2 px-3">
                        {(idx + 1).toString().padStart(2, "0")}
                      </td>
                      <td className="py-2 px-3">
                        <span className="bg-gray-100 px-3 py-1 rounded font-semibold shadow text-gray-700">
                          {carNo}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium">{title || "-"}</div>
                        <div className="text-xs text-gray-500">
                          {addressOf(car.location)}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium">{name}</div>
                        <div className="text-xs text-gray-500">{phone}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`flex items-center gap-2 font-semibold ${
                            statusText[sKey] || "text-gray-700"
                          }`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full ${
                              statusStyles[sKey] || "bg-gray-400"
                            }`}
                          ></span>
                          {b.status || "-"}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold">
                        ₹{Number(b.totalAmount || 0).toFixed(0)}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => openDetails(b)}
                          className="bg-[#2f1c53] hover:bg-[#3d3356] text-white px-5 py-2 rounded font-medium text-sm shadow"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details modal */}
      {detailsOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDetailsOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-[92vw] max-w-3xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-[#2A1A3B]">Booking Details</h3>
              <button
                onClick={() => setDetailsOpen(false)}
                className="px-2 py-1 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {(() => {
                const b = selected;
                const car = b.car || {};
                const renter = b.user || {};
                const title =
                  car.name || [car.brand, car.model].filter(Boolean).join(" ");
                const carNo = car.carnumber || "-";
                const renterName =
                  renter.fullName || renter.name || renter.username || "-";
                const renterPhone = renter.mobile || renter.phone || "-";
                const addr = addressOf(car.location);

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 border rounded-lg p-2">
                        <span className="text-gray-500">Car:</span> {title}
                      </div>
                      <div className="bg-gray-50 border rounded-lg p-2">
                        <span className="text-gray-500">Car No:</span> {carNo}
                      </div>
                      <div className="bg-gray-50 border rounded-lg p-2">
                        <span className="text-gray-500">Renter:</span>{" "}
                        {renterName}
                      </div>
                      <div className="bg-gray-50 border rounded-lg p-2">
                        <span className="text-gray-500">Renter Phone:</span>{" "}
                        {renterPhone}
                      </div>
                      <div className="bg-gray-50 border rounded-lg p-2">
                        <span className="text-gray-500">Pickup:</span>{" "}
                        {formatDateTime(b.pickupAt)}
                      </div>
                      <div className="bg-gray-50 border rounded-lg p-2">
                        <span className="text-gray-500">Dropoff:</span>{" "}
                        {formatDateTime(b.dropoffAt)}
                      </div>
                      <div className="bg-gray-50 border rounded-lg p-2 sm:col-span-2">
                        <span className="text-gray-500">Pickup Area:</span>{" "}
                        {addr || "-"}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm">
                        <div className="text-gray-500">Total</div>
                        <div className="text-xl font-bold text-[#2A1A3B]">
                          ₹{Number(selected.totalAmount || 0).toFixed(0)}
                        </div>
                        {selected.payment?.status && (
                          <div className="text-xs text-gray-500">
                            Payment: {selected.payment.status}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {selected?.status === "confirmed" && (
                          <button
                            onClick={() => viewLicensePdf(selected)}
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                          >
                            View License (PDF)
                          </button>
                        )}
                        {selected.car?.location &&
                          (selected.car.location.lat != null ||
                            selected.car.location.city ||
                            selected.car.location.area) && (
                            <button
                              onClick={() => {
                                setDetailsOpen(false);
                                openMap(selected.car);
                              }}
                              className="px-4 py-2 rounded-lg bg-[#2A1A3B] text-white font-semibold hover:bg-[#1c1128]"
                            >
                              Show Pickup Location
                            </button>
                          )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Map modal */}
      {mapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMapOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-[92vw] max-w-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-[#2A1A3B]">Pickup Location</h3>
              <button
                onClick={() => setMapOpen(false)}
                className="px-2 py-1 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <div className="rounded-xl overflow-hidden border">
                <iframe
                  title={mapData.title || "Pickup"}
                  src={
                    mapData.lat != null && mapData.lng != null
                      ? `https://maps.google.com/maps?ll=${mapData.lat},${mapData.lng}&z=14&t=m&output=embed`
                      : `https://maps.google.com/maps?q=${encodeURIComponent(
                          mapData.address || mapData.title
                        )}&z=14&t=m&output=embed&iwloc=0`
                  }
                  width="100%"
                  height="360"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              {mapData.address && (
                <div className="mt-2 text-xs text-gray-600">
                  Area: {mapData.address}
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t flex justify-end">
              <a
                className="px-4 py-2 rounded-lg bg-[#2A1A3B] text-white font-semibold hover:bg-[#1c1128]"
                target="_blank"
                rel="noreferrer"
                href={
                  mapData.lat != null && mapData.lng != null
                    ? `https://www.google.com/maps/search/?api=1&query=${mapData.lat},${mapData.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        mapData.address || mapData.title
                      )}`
                }
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;
