import React, { useEffect, useMemo, useState } from "react";
import { MdDirectionsCar } from "react-icons/md";
import ListCar from "./ListCar";
import { FiPlus } from "react-icons/fi";

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
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfPrevMonth = (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1);
const endOfPrevMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 0);
const INR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

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

function Overview({ ownerName }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapData, setMapData] = useState({
    title: "",
    lat: null,
    lng: null,
    address: "",
  });

  const token = useMemo(() => {
    const t =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    return t ? t.replace(/^"+|"+$/g, "") : "";
  }, []);

  const [carsCount, setCarsCount] = useState(0);
  const [loadingCars, setLoadingCars] = useState(true);
  const [showListCar, setShowListCar] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_URL}/api/cars/mycars`, {
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

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setErr("Authentication token not found");
        setLoading(false);
        return;
      }
      setErr("");
      setLoading(true);
      try {
        const [carsRes, bookRes] = await Promise.all([
          fetch(`${API_URL}/api/cars/mycars`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/bookings?scope=owner`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const carsJson = await carsRes.json();
        const bookJson = await bookRes.json();
        if (!carsRes.ok || !carsJson.success)
          throw new Error(carsJson.message || "Failed to fetch cars");
        if (!bookRes.ok || !bookJson.success)
          throw new Error(bookJson.message || "Failed to fetch bookings");

        const carsWithImages = (carsJson.cars || []).map((car) => ({
          ...car,
          images: car.image || [],
        }));
        setCars(carsWithImages);
        setBookings(Array.isArray(bookJson.bookings) ? bookJson.bookings : []);
      } catch (e) {
        setErr(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, [token]);

  // Owner income and status metrics
  const metrics = useMemo(() => {
    const eligible = bookings.filter((b) =>
      ["confirmed", "completed"].includes((b.status || "").toLowerCase())
    );
    const sum = (arr) =>
      arr.reduce((n, b) => n + Number(b.totalAmount || 0), 0);

    // Today / Yesterday
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStart = startOfDay(yesterday);
    const yEnd = endOfDay(yesterday);

    const todayIncome = sum(
      eligible.filter((b) => {
        const d = toDate(b.pickupAt);
        return d && d >= todayStart && d <= todayEnd;
      })
    );
    const yesterdayIncome = sum(
      eligible.filter((b) => {
        const d = toDate(b.pickupAt);
        return d && d >= yStart && d <= yEnd;
      })
    );
    const todayDeltaPct =
      yesterdayIncome > 0
        ? ((todayIncome - yesterdayIncome) / yesterdayIncome) * 100
        : 0;

    // Last 7 days
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const lastWeekIncome = sum(
      eligible.filter((b) => {
        const d = toDate(b.pickupAt);
        return d && d >= weekStart && d <= now;
      })
    );

    // Total / Month / Prev month
    const totalIncome = sum(eligible);
    const monthStart = startOfMonth(now);
    const monthIncome = sum(
      eligible.filter((b) => {
        const d = toDate(b.pickupAt);
        return d && d >= monthStart;
      })
    );
    const prevStart = startOfPrevMonth(now);
    const prevEnd = endOfPrevMonth(now);
    const prevMonthIncome = sum(
      eligible.filter((b) => {
        const d = toDate(b.pickupAt);
        return d && d >= prevStart && d <= prevEnd;
      })
    );
    const momPct =
      prevMonthIncome > 0
        ? ((monthIncome - prevMonthIncome) / prevMonthIncome) * 100
        : 0;

    // Hire vs Cancel (today)
    const todayBookings = bookings.filter((b) => {
      const d = toDate(b.pickupAt);
      return d && sameDay(d, now);
    });
    const todayCounts = todayBookings.reduce(
      (acc, b) => {
        const k = (b.status || "").toLowerCase();
        if (k === "confirmed" || k === "completed") acc.hired += 1;
        else if (k === "cancelled") acc.cancelled += 1;
        else acc.pending += 1;
        return acc;
      },
      { hired: 0, cancelled: 0, pending: 0 }
    );
    const totalToday =
      todayCounts.hired + todayCounts.cancelled + todayCounts.pending || 1;
    const pct = (n) => Math.round((n / totalToday) * 100);

    // Hire vs Cancel (ALL-TIME)
    const overallCounts = bookings.reduce(
      (acc, b) => {
        const k = (b.status || "").toLowerCase();
        if (k === "confirmed" || k === "completed") acc.hired += 1;
        else if (k === "cancelled") acc.cancelled += 1;
        else acc.pending += 1;
        return acc;
      },
      { hired: 0, cancelled: 0, pending: 0 }
    );
    const totalOverall =
      overallCounts.hired + overallCounts.cancelled + overallCounts.pending ||
      1;
    const pctAllTime = (n) => Math.round((n / totalOverall) * 100);

    return {
      todayIncome,
      yesterdayIncome,
      todayDeltaPct,
      lastWeekIncome,
      totalIncome,
      monthIncome,
      prevMonthIncome,
      momPct,
      todayPct: {
        hired: pct(todayCounts.hired),
        cancelled: pct(todayCounts.cancelled),
        pending: pct(todayCounts.pending),
      },
      overallPct: {
        hired: pctAllTime(overallCounts.hired),
        cancelled: pctAllTime(overallCounts.cancelled),
        pending: pctAllTime(overallCounts.pending),
      },
    };
  }, [bookings, now]);

  const formattedDate = now.toLocaleString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Recent bookings for table
  const recent = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 12),
    [bookings]
  );

  // NEW: same actions as Booking.jsx
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
  const viewLicensePdf = async (booking) => {
    try {
      const res = await fetch(
        `${API_URL}/api/bookings/${booking._id}/renter-license`,
        { headers: { Authorization: `Bearer ${token}` } }
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

  return (
    <div className="md:flex gap-2">
      <div className="bg-[#f7f6f2] p-4 space-y-4 min-w-[300px] md:h-screen">
        {/* Owner info */}
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Car Owner</h2>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>

        {/* Income (Today) */}
        <div className="bg-white rounded-xl shadow p-4 space-y-1">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Income</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              Today
            </span>
          </div>
          <hr className="border-gray-200 mt-2" />
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-green-600 mt-1">
              {INR(metrics.todayIncome)}
            </p>
            <p
              className={`text-sm ${
                metrics.todayDeltaPct >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {metrics.todayDeltaPct >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(metrics.todayDeltaPct).toFixed(1)}%
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Compared to {INR(metrics.yesterdayIncome)} yesterday
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 mt-0">Last week Income</p>
            <p className="text-xs text-gray-700 mt-0">
              <b>{INR(metrics.lastWeekIncome)}</b>
            </p>
          </div>
        </div>

        {/* Total Income (with MoM like your card) */}
        <div className="bg-white rounded-xl shadow p-4 space-y-1">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span className="font-medium">Total Income</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">All</span>
          </div>
          <hr className="border-gray-200 mt-2" />
          <div className="mt-2 flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-gray-900">
                {INR(metrics.totalIncome)}
              </p>
              <span
                className={`text-sm font-semibold ${
                  metrics.momPct >= 0 ? "text-green-600" : "text-red-600"
                }`}
                title="Change vs last month"
              >
                {metrics.momPct >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(metrics.momPct).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">Last Month Income</span>
            <span className="text-sm text-gray-700 font-medium">
              {INR(metrics.prevMonthIncome)}
            </span>
          </div>
        </div>

        {/* Hire vs Cancel (all-time) */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
            <span>Hire vs Cancel</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">All</span>
          </div>

          <div className="flex justify-center">
            <div className="relative w-24 h-24 rounded-full border-[15px] border-blue-600 border-t-red-500 border-r-green-500" />
          </div>

          <div className="mt-4 text-sm space-y-1">
            <div className="flex items-center gap-2 justify-between">
              <div>
                <span className="w-3 h-3 bg-green-600 rounded-full inline-block" />
                &nbsp;Total Hired
              </div>
              <span className="text-green-600">
                {metrics.overallPct.hired}%
              </span>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <div>
                <span className="w-3 h-3 bg-red-600 rounded-full inline-block" />
                &nbsp;Total Canceled
              </div>
              <span className="text-red-600">
                {metrics.overallPct.cancelled}%
              </span>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <div>
                <span className="w-3 h-3 bg-purple-800 rounded-full inline-block" />
                &nbsp;Total Pending
              </div>
              <span className="text-gray-800">
                {metrics.overallPct.pending}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
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
        
        <div className="bg-white rounded-xl shadow p-6 m-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Live Car Status</h2>
          </div>

          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : err ? (
            <div className="text-red-600">{err}</div>
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
                      <td
                        colSpan={7}
                        className="py-6 text-center text-gray-500"
                      >
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* NEW: Details modal (same as Booking.jsx) */}
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

      {/* NEW: Map modal */}
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

export default Overview;