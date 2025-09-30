import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function RentCarPage() {

  const API_URL = process.env.REACT_APP_API_URL;

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pickupAt, setPickupAt] = useState("");
  const [dropoffAt, setDropoffAt] = useState("");
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [booking, setBooking] = useState({
    loading: false,
    error: "",
    success: false,
  });

  const bookingRefMobile = useRef(null);
  const bookingRefDesktop = useRef(null);

  // Decode role from JWT (no verification, just read payload)
  const auth = useMemo(() => {
    const raw =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!raw) return { token: "", role: null };
    const token = raw.replace(/^"+|"+$/g, "");
    const decode = (t) => {
      try {
        const base64 = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = JSON.parse(atob(base64));
        return json;
      } catch {
        return {};
      }
    };
    const p = decode(token);
    // Common claim names
    const rawRole =
      p.role ||
      p.roles?.[0] ||
      p.user?.role ||
      p["https://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      null;

    // IMPORTANT: normalize role (trim + lowercase) to avoid trailing spaces/case issues
    const role =
      typeof rawRole === "string" ? rawRole.trim().toLowerCase() : null;

    return { token, role };
  }, []);

  // Fetch car
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cars/${id}/details`);
        const data = await res.json();
        if (res.ok && data.success) {
          setCar(data.car);
        }
      } catch {}
      setLoading(false);
    };
    fetchCar();
  }, [id]);

  useEffect(() => {
    if (!pickupAt) {
      const start = new Date();
      start.setHours(start.getHours() + 4, 0, 0, 0);
      const end = new Date(start.getTime());
      end.setHours(end.getHours() + 24);
      const fmt = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}T${String(
          d.getHours()
        ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      setPickupAt(fmt(start));
      setDropoffAt(fmt(end));
    }
  }, [pickupAt]);

  useEffect(() => {
    if (!pickupAt || !dropoffAt) return;
    const p = new Date(pickupAt).getTime();
    const d = new Date(dropoffAt).getTime();
    const minDrop = p + 4 * 60 * 60 * 1000;
    if (d < minDrop) {
      const newDrop = new Date(minDrop);
      const fmt = (x) =>
        `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(x.getDate()).padStart(2, "0")}T${String(
          x.getHours()
        ).padStart(2, "0")}:${String(x.getMinutes()).padStart(2, "0")}`;
      setDropoffAt(fmt(newDrop));
    }
  }, [pickupAt, dropoffAt]);

  // Quote pricing/availability
  useEffect(() => {
    const run = async () => {
      if (!pickupAt || !dropoffAt) return;
      setQuoting(true);
      try {
        const res = await fetch("${API_URL}/api/bookings/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carId: id,
            pickupAt: new Date(pickupAt).toISOString(),
            dropoffAt: new Date(dropoffAt).toISOString(),
          }),
        });
        const data = await res.json();
        setQuote(res.ok ? data : null);
      } catch {
        setQuote(null);
      } finally {
        setQuoting(false);
      }
    };
    run();
  }, [id, pickupAt, dropoffAt]);

  const handleBook = async () => {
    // Block non-renters
    if (auth.role && auth.role !== "renter") {
      setBooking({
        loading: false,
        error: "Only renter accounts can book.",
        success: false,
      });
      return;
    }

    setBooking({ loading: true, error: "", success: false });
    try {
      let token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (!token) {
        setBooking({ loading: false, error: "", success: false });
        navigate("/login", {
          state: { next: location.pathname + location.search },
        });
        return;
      }
      token = token.replace(/^"+|"+$/g, "");

      const res = await fetch("${API_URL}/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carId: id,
          pickupAt: new Date(pickupAt).toISOString(),
          dropoffAt: new Date(dropoffAt).toISOString(),
          paymentMethod: "cod",
        }),
      });
      const data = await res.json();

      if (res.status === 403 && (data?.code === "USER_NOT_VERIFIED" || data?.code === "ROLE_NOT_ALLOWED")) {
        setBooking({
          loading: false,
          error: data?.message || "Action not allowed.",
          success: false,
        });
        if (data?.code === "USER_NOT_VERIFIED") {
          setTimeout(() => navigate("/renter/dashboard"), 2500);
        }
        return;
      }

      if (!res.ok) throw new Error(data.message || "Booking failed");

      setBooking({ loading: false, error: "", success: true });
    } catch (e) {
      setBooking({ loading: false, error: e.message, success: false });
    }
  };

  const RZP_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID || "";

  const handleRazorpayPayment = async () => {
    // Check if key is available
    if (!RZP_KEY) {
      alert("Payment temporarily unavailable (missing key).");
      return;
    }

    if (!quote?.available || !quote?.totalAmount) {
      alert("Car not available for selected time.");
      return;
    }

    try {
      // 1. Create order on backend
      const res = await fetch("${API_URL}/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(quote.totalAmount * 100), // Convert to paise
          receipt: `rcptid_${id}_${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert("Payment initiation failed");
        return;
      }

      // 2. Open Razorpay checkout
      const options = {
        key: RZP_KEY, // Now using env variable
        amount: data.order.amount,
        currency: data.order.currency,
        name: "AutoConnect Car Rental",
        description: `Booking for ${car.brand} ${car.model}`,
        order_id: data.order.id,
        handler: async function (response) {
          // 3. On payment success, book the car
          let token =
            localStorage.getItem("token") || localStorage.getItem("accessToken");
          if (!token) {
            alert("Please login to book.");
            return;
          }
          token = token.replace(/^"+|"+$/g, "");

          const bookingRes = await fetch("${API_URL}/api/bookings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              carId: id,
              pickupAt: new Date(pickupAt).toISOString(),
              dropoffAt: new Date(dropoffAt).toISOString(),
              paymentMethod: "razorpay",
              paymentDetails: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
            }),
          });
          const bookingData = await bookingRes.json();
          if (bookingRes.ok && bookingData.success) {
            alert("Booking confirmed!");
            setBooking({ loading: false, error: "", success: true });
          } else {
            alert("Booking failed: " + (bookingData.message || "Unknown error"));
            console.error("Booking error:", bookingData);
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed");
          },
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: { color: "#2A1A3B" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      alert("Payment failed to initialize");
    }
  };

  // Convenience flag for UI
  const canBookAsRole = !auth.role || auth.role === "renter";
  const isOwner = auth.role === "owner";

  const scrollToBooking = () => {
    (bookingRefMobile.current || bookingRefDesktop.current)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const { mapSrc, shownArea } = useMemo(() => {
    if (!car?.location) return { mapSrc: "", shownArea: "" };
    const lat = car.location.lat;
    const lng = car.location.lng;
    const areaText = [car.location.area, car.location.city, car.location.state]
      .filter(Boolean)
      .join(", ");
    const hasArea = !!car.location.area;
    const hasCity = !!car.location.city;
    const zoom = hasArea ? 13 : hasCity ? 12 : 9;

    const src =
      lat != null && lng != null
        ? `https://maps.google.com/maps?ll=${lat},${lng}&z=${zoom}&t=m&output=embed`
        : `https://maps.google.com/maps?q=${encodeURIComponent(
            areaText || car.location?.city || ""
          )}&z=${zoom}&t=m&output=embed&iwloc=0`;

    return { mapSrc: src, shownArea: areaText || car.location?.city || "" };
  }, [car]);

  // Helpers
  const fmtLocal = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;

  const minPickupStr = useMemo(() => {
    const t = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3h lead
    return fmtLocal(t);
  }, []);

  const minDropStr = useMemo(() => {
    if (!pickupAt)
      return fmtLocal(
        new Date(Date.now() + 3 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000)
      );
    const t = new Date(new Date(pickupAt).getTime() + 4 * 60 * 60 * 1000); // +4h duration
    return fmtLocal(t);
  }, [pickupAt]);

  if (loading) {
    return (
      <div>
        <div className="relative z-50">
          <Header />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 py-10">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-64 rounded-2xl bg-gray-200" />
            <div className="lg:col-span-4 h-64 rounded-2xl bg-gray-200" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!car) {
    window.location.href = "/404";
  }

  return (
    <div>
      <div className="relative z-50">
        <Header />
      </div>

      <main className="pt-16 sm:pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <section className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2A1A3B]">
                {car.brand} {car.model}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {car.location?.city}, {car.location?.state}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="order-1 lg:order-1 lg:col-span-8 space-y-6">
            <div className="rounded-2xl overflow-hidden bg-white border">
              <div className="w-full h-64 sm:h-80 lg:h-[420px] bg-gray-100">
                <img
                  src={car.images?.[0] || car.image}
                  alt={car.name || `${car.brand} ${car.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Specs */}
            <div className="bg-white rounded-2xl border p-5">
              <h2 className="text-lg font-semibold text-[#2A1A3B] mb-3">
                Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div className="px-3 py-2 rounded-lg bg-[#f7f6fa]">
                  <span className="font-medium">Year:</span> {car.year || "-"}
                </div>
                <div className="px-3 py-2 rounded-lg bg-[#f7f6fa]">
                  <span className="font-medium">Seats:</span> {car.seats || "-"}
                </div>
                <div className="px-3 py-2 rounded-lg bg-[#f7f6fa]">
                  <span className="font-medium">Fuel:</span>{" "}
                  {car.fuelType || "-"}
                </div>
                <div className="px-3 py-2 rounded-lg bg-[#f7f6fa]">
                  <span className="font-medium">Transmission:</span>{" "}
                  {car.transmission || "-"}
                </div>
              </div>
            </div>

            {/* Booking (mobile only) - placed RIGHT AFTER Specs */}
            <div ref={bookingRefMobile} className="lg:hidden">
              <div className="bg-white border rounded-2xl p-5">
                <h3 className="text-lg font-semibold text-[#2A1A3B] mb-3">
                  Book this car
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Pickup
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-offset-1 focus:ring-[#2A1A3B] outline-none"
                      value={pickupAt}
                      onChange={(e) => setPickupAt(e.target.value)}
                      min={minPickupStr} // enforce 3h lead
                      disabled={isOwner} // NEW
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Dropoff
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-offset-1 focus:ring-[#2A1A3B] outline-none"
                      value={dropoffAt}
                      onChange={(e) => setDropoffAt(e.target.value)}
                      min={minDropStr} // enforce 4h min duration
                      disabled={isOwner} // NEW
                    />
                  </div>
                </div>

                {/* Role notice (mobile) */}
                {!canBookAsRole && (
                  <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 p-3 text-sm">
                    {isOwner
                      ? "You are logged in as an owner, so you cannot book this car. To book, please log in with a renter account."
                      : "Your current account is not allowed to book. Please log in with a renter account."}
                    <div className="mt-2">
                      <button
                        onClick={() =>
                          navigate("/login", {
                            state: { next: location.pathname + location.search },
                          })
                        }
                        className="px-4 py-1.5 rounded-md bg-[#2A1A3B] text-white text-sm font-semibold hover:bg-[#1c1128]"
                      >
                        Login as renter
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  {quoting ? (
                    <div className="text-gray-600 text-sm">
                      Checking availability...
                    </div>
                  ) : quote ? (
                    quote.success ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm">
                            <div className="mb-1">
                              Status:{" "}
                              <span
                                className={`font-semibold ${
                                  quote.available
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {quote.available
                                  ? "Available"
                                  : "Not Available"}
                              </span>
                            </div>
                            <div>
                              Hours: {quote.hours != null ? quote.hours : "-"}
                            </div>
                            <div>
                              Charged Days:{" "}
                              {quote.billableDays != null
                                ? quote.billableDays
                                : "-"}
                            </div>
                            <div>Price/Day: ₹{quote.pricePerDay}</div>
                            <div className="font-semibold mt-1">
                              Total: ₹{quote.totalAmount} {quote.currency}
                            </div>
                          </div>
                          <button
                            disabled={
                              !quote.available || booking.loading || !canBookAsRole
                            }
                            onClick={handleRazorpayPayment}
                            className={`px-5 py-2 rounded-lg font-semibold whitespace-nowrap ${
                              !quote.available || !canBookAsRole
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "bg-[#2A1A3B] text-white hover:bg-[#1c1128]"
                            }`}
                          >
                            {booking.loading ? "Booking..." : "Confirm Booking"}
                          </button>
                        </div>
                        {/* Deduplicate messages: show overlap OR generic message */}
                        {quote.overlap ? (
                          <div className="text-xs text-red-600">
                            Selected dates overlap with an existing booking.
                          </div>
                        ) : !quote.available && quote.message ? (
                          <div className="text-xs text-red-600">
                            {quote.message}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="text-red-600 text-sm">
                        Failed to get quote
                      </div>
                    )
                  ) : null}
                  {booking.error && (
                    <div className="mt-3 text-sm text-red-600">
                      {booking.error}
                    </div>
                  )}
                  {booking.success && (
                    <div className="mt-3 text-sm text-green-600">
                      Booking confirmed!
                    </div>
                  )}
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  By booking, you agree to the platform terms & policies.
                </p>
              </div>
            </div>

            {/* Description */}
            {car.description ? (
              <div className="bg-white rounded-2xl border p-5">
                <h2 className="text-lg font-semibold text-[#2A1A3B] mb-2">
                  Description
                </h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  {car.description}
                </p>
              </div>
            ) : null}

            {/* Pickup Area Map */}
            {mapSrc && (car.location?.lat != null || shownArea) ? (
              <div className="bg-white rounded-2xl border p-5">
                <h2 className="text-lg font-semibold text-[#2A1A3B] mb-3">
                  Pickup Area: {shownArea}
                </h2>
                <div className="rounded-xl overflow-hidden border">
                  <iframe
                    title="Pickup Area"
                    src={mapSrc}
                    width="100%"
                    height="360"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Right: Booking card (desktop only, sticky) */}
          <div className="order-2 lg:order-2 lg:col-span-4 hidden lg:block">
            <div ref={bookingRefDesktop} className="lg:sticky lg:top-24">
              <div className="bg-white border rounded-2xl p-5">
                <h3 className="text-lg font-semibold text-[#2A1A3B] mb-3">
                  Book this car
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Pickup
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-offset-1 focus:ring-[#2A1A3B] outline-none"
                      value={pickupAt}
                      onChange={(e) => setPickupAt(e.target.value)}
                      min={minPickupStr}
                      disabled={isOwner} // NEW
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Dropoff
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-offset-1 focus:ring-[#2A1A3B] outline-none"
                      value={dropoffAt}
                      onChange={(e) => setDropoffAt(e.target.value)}
                      min={minDropStr}
                      disabled={isOwner} // NEW
                    />
                  </div>
                </div>

                {/* Role notice (desktop) */}
                {!canBookAsRole && (
                  <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 p-3 text-sm">
                    {isOwner
                      ? "You are logged in as an owner, so you cannot book this car. To book, please log in with a renter account."
                      : "Your current account is not allowed to book. Please log in with a renter account."}
                    <div className="mt-2">
                      <button
                        onClick={() =>
                          navigate("/login", {
                            state: { next: location.pathname + location.search },
                          })
                        }
                        className="px-4 py-1.5 rounded-md bg-[#2A1A3B] text-white text-sm font-semibold hover:bg-[#1c1128]"
                      >
                        Login as renter
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  {quoting ? (
                    <div className="text-gray-600 text-sm">
                      Checking availability...
                    </div>
                  ) : quote ? (
                    quote.success ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm">
                            <div className="mb-1">
                              Status:{" "}
                              <span
                                className={`font-semibold ${
                                  quote.available
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {quote.available
                                  ? "Available"
                                  : "Not Available"}
                              </span>
                            </div>
                            <div>
                              Hours: {quote.hours != null ? quote.hours : "-"}
                            </div>
                            <div>
                              Charged Days:{" "}
                              {quote.billableDays != null
                                ? quote.billableDays
                                : "-"}
                            </div>
                            <div>Price/Day: ₹{quote.pricePerDay}</div>
                            <div className="font-semibold mt-1">
                              Total: ₹{quote.totalAmount} {quote.currency}
                            </div>
                          </div>
                          <button
                            disabled={
                              !quote.available || booking.loading || !canBookAsRole
                            }
                            onClick={handleRazorpayPayment}
                            className={`px-5 py-2 rounded-lg font-semibold whitespace-nowrap ${
                              !quote.available || !canBookAsRole
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "bg-[#2A1A3B] text-white hover:bg-[#1c1128]"
                            }`}
                          >
                            {booking.loading ? "Booking..." : "Confirm Booking"}
                          </button>
                        </div>
                        {/* Deduplicate messages: show overlap OR generic message */}
                        {quote.overlap ? (
                          <div className="text-xs text-red-600">
                            Selected dates overlap with an existing booking.
                          </div>
                        ) : !quote.available && quote.message ? (
                          <div className="text-xs text-red-600">
                            {quote.message}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="text-red-600 text-sm">
                        Failed to get quote
                      </div>
                    )
                  ) : null}
                  {booking.error && (
                    <div className="mt-3 text-sm text-red-600">
                      {booking.error}
                    </div>
                  )}
                  {booking.success && (
                    <div className="mt-3 text-sm text-green-600">
                      Booking confirmed!
                    </div>
                  )}
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  By booking, you agree to the platform terms & policies.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default RentCarPage;