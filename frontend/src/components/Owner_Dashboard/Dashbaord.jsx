import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import OwnerVerification from "./OwnerVerification";
import ListCar from "./ListCar";

function Dashboard() {
  const [verified, setVerified] = useState(false);
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [showListCar, setShowListCar] = useState(false);
  const [cars, setCars] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAddCar = async (car) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("title", car.title);
      formData.append("brand", car.brand);
      formData.append("model", car.model);
      formData.append("carnumber", car.carnumber);
      formData.append("year", car.year);
      formData.append("pricePerDay", car.pricePerDay);
      formData.append("fuelType", car.fuelType);
      formData.append("transmission", car.transmission);
      formData.append("seats", car.seats);
      formData.append("location", JSON.stringify(car.location));
      formData.append("description", car.description);

      car.images.forEach((img) => {
        formData.append("images", img);
      });

      if (car.documents) {
        formData.append("rc", car.documents.rc);
        formData.append("insurance", car.documents.insurance);
        formData.append("pollution", car.documents.pollution);
      }

      const res = await fetch("http://localhost:5000/api/cars/addcar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCars((prevCars) => [...prevCars, data.car]);
      } else {
        alert(data.message || "Failed to add car");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    }
  };

  useEffect(() => {
    const fetchCars = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/cars/mycars", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Map image -> images for frontend compatibility
        const carsWithImages = data.cars.map((car) => ({
          ...car,
          images: car.image || [],
        }));
        setCars(carsWithImages);
      }
    };
    if (verified) fetchCars();
  }, [verified]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full font-sans bg-gray-100">
      <Sidebar active="Dashboard" open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 px-2 md:px-6 py-2 md:py-4 overflow-auto">
        {!verified ? (
          <OwnerVerification
            onVerify={() => setVerified(true)}
            aadhar={aadhar}
            setAadhar={setAadhar}
            pan={pan}
            setPan={setPan}
          />
        ) : (
          <>
            {/* Responsive Header */}
            <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center mb-4">
              <div className="flex items-center gap-2 w-full">
                <button
                  className="md:hidden bg-black text-white p-2 rounded mr-2"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  ☰
                </button>
                <span className="text-xl font-bold">Welcome, Ramesh!</span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                <input
                  type="text"
                  placeholder="Search here"
                  className="border px-4 py-2 rounded-md w-full md:w-64"
                />
                <span className="text-xl">🔔</span>
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
              </div>
            </div>
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
              <div className="bg-white rounded shadow p-4">
                <div className="text-gray-500 text-sm">Income</div>
                <div className="text-2xl font-bold text-green-600">$946.00</div>
                <div className="text-xs text-red-500">▼ 1.5%</div>
                <div className="text-xs text-gray-500">
                  Compared to $1020 yesterday
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Last week Income $2565.00
                </div>
              </div>
              <div className="bg-white rounded shadow p-4">
                <div className="text-gray-500 text-sm">Total Income</div>
                <div className="text-2xl font-bold text-green-600">
                  $15,660.00
                </div>
                <div className="text-xs text-green-500">▲ 2.5%</div>
                <div className="text-xs text-gray-500">
                  Last Month Income $13,000.00
                </div>
              </div>
              <div className="bg-white rounded shadow p-4">
                <div className="text-sm text-gray-500">Hire vs Cancel</div>
                <div className="flex justify-center items-center mt-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-8 border-blue-500 border-t-red-500 border-r-green-500"></div>
                </div>
                <div className="text-xs mt-4 text-center">
                  <span className="text-blue-600 font-bold">Total Hired:</span>{" "}
                  54% ↑ &nbsp;
                  <span className="text-green-600 font-bold">
                    Canceled:
                  </span>{" "}
                  20% &nbsp;
                  <span className="text-red-600 font-bold">Pending:</span> 26%
                </div>
              </div>
            </div>
            {/* Car Status Table */}
            <div className="mt-8 md:mt-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 md:gap-0">
                <h2 className="text-lg font-bold">Live Car Status</h2>
                <div className="flex items-center gap-2 md:gap-4">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium"
                    onClick={() => setShowListCar(true)}
                  >
                    + List A New Car
                  </button>
                  <span className="text-sm text-gray-500">
                    🚗 {cars.length} Active Listing
                  </span>
                </div>
              </div>
              <div className="bg-white shadow rounded overflow-x-auto">
                <div className="min-w-[600px] grid grid-cols-6 font-semibold px-4 py-2 border-b bg-gray-100">
                  <div>No.</div>
                  <div>Car No.</div>
                  <div>Model</div>
                  <div>Description</div>
                  <div>Images</div>
                  <div></div>
                </div>
                {cars.map((car, idx) => (
                  <div
                    key={idx}
                    className="min-w-[600px] grid grid-cols-6 items-center px-4 py-3 border-t hover:bg-gray-50"
                  >
                    <div>{(idx + 1).toString().padStart(2, "0")}</div>
                    <div>{car.carnumber}</div>
                    <div>{car.model}</div>
                    <div className="truncate">{car.description}</div>
                    <div className="flex gap-1">
                      {car.images.map((img, i) => (
                        <img
                          key={i}
                          src={
                            img.startsWith("data:")
                              ? img
                              : `data:image/jpeg;base64,${img}`
                          }
                          alt="Car"
                          className="w-10 h-8 object-cover rounded"
                        />
                      ))}
                    </div>
                    <button className="text-blue-600 border border-blue-600 px-3 py-1 rounded text-sm">
                      Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* ListCar Modal */}
            {showListCar && (
              <ListCar
                onAddCar={handleAddCar}
                onClose={() => setShowListCar(false)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;