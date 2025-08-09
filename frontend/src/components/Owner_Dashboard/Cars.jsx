import React, { useState, useEffect } from "react";
import Topbar from "./Topbar";
import { MdWarningAmber, MdEdit, MdAdd } from "react-icons/md";
import { FaStar } from "react-icons/fa";

function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    };

    fetchCars();
  }, []);

  // Handle Maintenance button click
  const handleMaintenance = async (carId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/cars/${carId}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ available: false }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setCars((prev) =>
          prev.map((car) =>
            car._id === carId ? { ...car, availability: false } : car
          )
        );
      } else {
        alert(data.message || "Failed to update availability");
      }
    } catch (err) {
      alert("Error updating availability");
    }
  };

  // Handle List Car button click
  const handleListCar = async (carId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/cars/${carId}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ available: true }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setCars((prev) =>
          prev.map((car) =>
            car._id === carId ? { ...car, availability: true } : car
          )
        );
      } else {
        alert(data.message || "Failed to update availability");
      }
    } catch (err) {
      alert("Error updating availability");
    }
  };

  return (
    <div>
      <Topbar />
      <div className="mt-8 md:mt-10 ml-3 mr-3">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center bg-white shadow-md rounded-xl px-4 py-3 animate-pulse"
              >
                <div className="w-16 h-16 rounded-full bg-gray-200" />
                <div className="flex-1 ml-4 min-w-0">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-24 mt-2"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded ml-4"></div>
                <div className="h-8 w-28 bg-gray-100 rounded ml-4"></div>
              </div>
            ))
          ) : cars.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No cars listed yet.
            </div>
          ) : (
            cars.map((car, idx) => (
              <div
                key={car._id || idx}
                className="flex items-center bg-white shadow-md rounded-xl shadow px-4 py-3"
              >
                {/* Car Image */}
                <img
                  src={
                    car.images && car.images.length > 0
                      ? car.images[0]
                      : "https://via.placeholder.com/64x64?text=Car"
                  }
                  alt={car.model}
                  className="w-16 h-16 rounded-full object-cover border border-gray-200"
                />

                {/* Car Info */}
                <div className="flex-1 ml-4 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-gray-800 truncate">
                      {car.brand} {car.model}
                    </span>
                    <span className="flex items-center text-yellow-500 text-sm font-semibold ml-2">
                      <FaStar className="mr-1" />
                      {car.rating || "4.5"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex gap-2 flex-wrap mt-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      {car.transmission}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      {car.fuelType}
                    </span>
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">Car No:</span>{" "}
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        {car.carnumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center flex-col gap-2 lg:flex-row">
                  <a
                    className="flex items-center gap-1 border border-[#2f1c53] text-white bg-[#2f2240] px-3 py-2 rounded-lg font-medium ml-4"
                    href={`/edit-car/${car._id}`}
                  >
                    <MdEdit className="text-lg" />
                    Edit
                  </a>

                  {/* Status Button */}
                  {car.availability !== false ? (
                    <button
                      className="flex items-center gap-1 border border-[#2f1c53] text-[#2f1c53] bg-[#f7f6f2] px-4 py-2 rounded-lg font-medium ml-4"
                      onClick={() => handleMaintenance(car._id)}
                    >
                      <MdWarningAmber className="text-lg" />
                      Maintenance
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-1 border border-[#2f1c53] text-[#2f1c53] bg-[#e6fbe6] px-4 py-2 rounded-lg font-medium ml-4"
                      onClick={() => handleListCar(car._id)}
                    >
                      <MdAdd className="text-lg" />
                      Put On Rent
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Cars;
