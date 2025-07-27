import React from "react";
import { useState, useEffect } from "react";
import Topbar from "./Topbar";

function Cars() {
  const [cars, setCars] = useState([]);
  
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
    }, []);

  return (
    <div>
      <Topbar/>
    <div className="mt-8 md:mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {cars.length === 0 ? (
          <div className="col-span-full text-gray-500 text-center py-8">
            No cars listed yet.
          </div>
        ) : (
          cars.map((car, idx) => (
            <div key={car._id || idx} className="bg-white rounded shadow p-4 flex flex-col">
              <div className="flex gap-2 mb-2">
                {car.images && car.images.length > 0 ? (
                  <img
                    src={car.images[0]}
                    alt={car.model}
                    className="w-24 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-24 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold">{car.brand} {car.model}</div>
                  <div className="text-xs text-gray-500">{car.carnumber}</div>
                  <div className="text-xs text-gray-500">{car.location?.city}, {car.location?.state}</div>
                </div>
              </div>
              <div className="text-sm mb-2 truncate">{car.description}</div>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-blue-600 font-bold">₹{car.pricePerDay}/day</span>
                <button className="text-blue-600 border border-blue-600 px-3 py-1 rounded text-xs">
                  Details
                </button>
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