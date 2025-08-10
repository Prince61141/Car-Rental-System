import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function RentCarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch car details by ID
    const fetchCar = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/cars/${id}/details`);
        const data = await res.json();
        if (res.ok && data.success) {
          setCar(data.car);
        }
      } catch {
        // handle error
      }
      setLoading(false);
    };
    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Car not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-10 bg-white rounded-2xl shadow-lg p-8">
      <button
        className="mb-4 text-[#2A1A3B] hover:underline"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex items-center justify-center">
          <img
            src={car.images?.[0] || car.image}
            alt={car.name}
            className="w-full max-w-xs h-64 object-contain rounded-xl bg-gray-100"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#2A1A3B] mb-2">{car.title || car.name}</h2>
          <div className="mb-2 text-gray-700">
            <span className="font-semibold">{car.brand}</span>{" "}
            {car.model && <span>{car.model}</span>}
          </div>
          <div className="mb-2 text-gray-600">
            <span className="mr-2">Year: {car.year}</span>
            <span className="mr-2">Seats: {car.seats}</span>
            <span className="mr-2">Fuel: {car.fuelType}</span>
            <span>Transmission: {car.transmission}</span>
          </div>
          <div className="mb-2 text-gray-600">
            <span>
              Location: {car.location?.city}, {car.location?.state}
            </span>
          </div>
          <div className="mb-4 text-gray-800">{car.description}</div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl font-bold text-[#2A1A3B]">
              ₹{car.pricePerDay || car.price}
            </span>
            <span className="text-gray-500 text-sm">/Day</span>
          </div>
          <button
            className="bg-[#2A1A3B] hover:bg-[#1c1128] text-white px-8 py-3 rounded-lg shadow transition-all duration-200 text-base font-semibold"
            // onClick={...} // Add booking logic here
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default RentCarPage;