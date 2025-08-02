import React, { useState, useEffect } from "react";

function Overview() {
  const [cars, setCars] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const fetchCars = async () => {
      const token = localStorage.getItem("token");
      if (!token) return alert("Authentication token not found");

      try {
        const res = await fetch("http://localhost:5000/api/cars/mycars", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.success) {
          const carsWithImages = data.cars.map((car) => ({
            ...car,
            images: car.image || [],
          }));
          setCars(carsWithImages);
        } else {
          alert(data.message || "Failed to fetch cars");
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching cars");
      }
    };

    fetchCars();

    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = now.toLocaleString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="md:flex gap-2">
      <div className="bg-[#f7f6f2] p-4 space-y-4 min-w-[280px]">
        {/* User Info */}
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Car Owner</h2>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>

        {/* Income Card */}
        <div className="bg-white rounded-xl shadow p-4 space-y-1">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Income</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              Today
            </span>
          </div>
          <hr className="border-gray-200" style={{ marginTop: "10px" }} />
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-green-600 mt-1">₹946.00</p>
            <p className="text-sm text-red-500">↓ 1.5%</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Compared to ₹1020 yesterday
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 mt-0">Last week Income</p>
            <p className="text-xs text-gray-500 mt-0">
              <b>₹2565.00</b>
            </p>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-xl shadow p-4 space-y-1">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Total Income</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">All</span>
          </div>
          <hr className="border-gray-200" style={{ marginTop: "10px" }} />
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-green-700 mt-1">₹15660.00</p>
            <p className="text-sm text-green-600">↑ 2.5%</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Last Month Income</p>
            <p className="text-xs text-gray-500">
              <b>₹13000.00</b>
            </p>
          </div>
        </div>

        {/* Hire vs Cancel */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
            <span>Hire vs Cancel</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              Today
            </span>
          </div>

          {/* Donut Chart (fake ring using borders) */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24 rounded-full border-[15px] border-blue-600 border-t-red-500 border-r-green-500" />
          </div>

          {/* Legend */}
          <div className="mt-4 text-sm space-y-1">
            <div className="flex items-center gap-2 justify-between">
              <div>
                <span className="w-3 h-3 bg-blue-600 rounded-full inline-block" />
                &nbsp;Total Hired
              </div>
              <span className="text-green-600">54% ↑</span>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <div>
                <span className="w-3 h-3 bg-green-600 rounded-full inline-block" />
                &nbsp;Total Canceled
              </div>
              <span className="text-gray-800">20% ↓</span>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <div>
                <span className="w-3 h-3 bg-red-600 rounded-full inline-block" />
                &nbsp;Total Pending
              </div>{" "}
              <span className="text-red-600">26% ↓</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-x-auto w-full">
        <div className="min-w-[800px] grid grid-cols-6 font-semibold text-gray-700 px-6 py-3 border-b bg-gray-100">
          <div>No.</div>
          <div>Car no.</div>
          <div>Driver</div>
          <div>Status</div>
          <div>Earning</div>
          <div className="text-right">Details</div>
        </div>

        {cars.map((car, idx) => (
          <div
            key={car._id || idx}
            className="min-w-[800px] grid grid-cols-6 items-center px-6 py-4 border-t hover:bg-gray-50"
          >
            <div>{(idx + 1).toString().padStart(2, "0")}</div>
            <div>{car.carnumber}</div>

            {/* Driver Info (you can customize this with actual driver data if available) */}
            <div className="flex items-center gap-2">
              <img
                src={`https://i.pravatar.cc/150?img=${idx + 1}`}
                className="w-8 h-8 rounded-full object-cover"
                alt="Driver"
              />
              <span className="text-sm font-medium text-gray-700">
                {car.driver || "Driver Name"}
              </span>
            </div>

            {/* Status dot */}
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`h-3 w-3 rounded-full ${
                  idx === 0
                    ? "bg-green-500"
                    : idx === 1
                    ? "bg-purple-800"
                    : "bg-red-500"
                }`}
              ></span>
              {idx === 0 ? "Completed" : idx === 1 ? "Pending" : "In route"}
            </div>

            <div className="text-sm font-medium text-gray-700">
              ${car.earning || "0.00"}
            </div>

            <div className="text-right">
              <button className="text-sm text-white bg-[#2f1c53] hover:bg-[#3f2e6c] px-4 py-1 rounded">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Overview;
