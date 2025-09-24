import React, { useEffect, useState } from "react";

export default function CarReport() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/cars/mycars", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setCars(data.cars || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchReport = (carId) => {
    setReport(null);
    setSelectedCar(carId);
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/owners/car-report/${carId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setReport(data.report || null))
      .catch(() => setReport(null));
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-[#2f2240]">Car Report</h2>
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading cars...</div>
      ) : cars.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No cars found for your account.
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Car</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedCar || ""}
              onChange={(e) => fetchReport(e.target.value)}
            >
              <option value="">-- Select a car --</option>
              {cars.map((car) => (
                <option key={car._id} value={car._id}>
                  {car.brand} {car.model} (
                  {car.carnumber || car.plate || car.reg})
                </option>
              ))}
            </select>
          </div>
          {report && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-[#2f2240]">
                Report for {report.car?.brand} {report.car?.model}
              </h3>
              {/* Service Required Alert */}
              {report.serviceRequired && (
                <div className="mb-6 p-4 rounded bg-red-100 border border-red-400 text-red-700 font-semibold text-center">
                  Service Required: Please schedule maintenance for this car.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#f6f4fa] rounded-lg p-4 border">
                  <div className="mb-2">
                    <span className="font-semibold">Total Bookings:</span>{" "}
                    {report.totalBookings}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Total Revenue:</span> ₹
                    {report.totalRevenue}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Total Days Booked:</span>{" "}
                    {report.totalDays}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Last Booking:</span>{" "}
                    {report.lastBookingDate
                      ? new Date(report.lastBookingDate).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
                <div className="bg-[#f6f4fa] rounded-lg p-4 border">
                  <div className="mb-2">
                    <span className="font-semibold">Car Number:</span>{" "}
                    {report.car?.carnumber ||
                      report.car?.plate ||
                      report.car?.reg}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Status:</span>{" "}
                    {report.car?.status || "N/A"}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Year:</span>{" "}
                    {report.car?.year || "N/A"}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Fuel Type:</span>{" "}
                    {report.car?.fuelType || "N/A"}
                  </div>
                </div>
              </div>
              {report.bookings && report.bookings.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-2">
                    Recent Bookings
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 border">Booking ID</th>
                          <th className="p-2 border">User</th>
                          <th className="p-2 border">From</th>
                          <th className="p-2 border">To</th>
                          <th className="p-2 border">Amount</th>
                          <th className="p-2 border">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.bookings.map((b) => (
                          <tr key={b._id}>
                            <td className="p-2 border">{b._id}</td>
                            <td className="p-2 border">
                              {b.user?.name || b.user?.fullName || "N/A"}
                            </td>
                            <td className="p-2 border">
                              {b.from
                                ? new Date(b.from).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="p-2 border">
                              {b.to
                                ? new Date(b.to).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="p-2 border">₹{b.amount}</td>
                            <td className="p-2 border">{b.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
