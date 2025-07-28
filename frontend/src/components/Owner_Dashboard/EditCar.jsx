import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    brand: "",
    model: "",
    carnumber: "",
    year: "",
    pricePerDay: "",
    fuelType: "",
    transmission: "",
    seats: "",
    description: "",
  });

  useEffect(() => {
    const fetchCar = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:5000/api/cars/${id}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCar(data.car);
          setForm({
            brand: data.car.brand || "",
            model: data.car.model || "",
            carnumber: data.car.carnumber || "",
            year: data.car.year || "",
            pricePerDay: data.car.pricePerDay || "",
            fuelType: data.car.fuelType || "",
            transmission: data.car.transmission || "",
            seats: data.car.seats || "",
            description: data.car.description || "",
          });
        } else {
          setMsg(data.message || "Failed to fetch car details");
        }
      } catch {
        setMsg("Error fetching car details");
      }
      setLoading(false);
    };
    fetchCar();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/cars/${id}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg("Car updated successfully!");
        setTimeout(() => navigate("/peer-owner/dashboard"), 1200);
      } else {
        setMsg(data.message || "Failed to update car");
      }
    } catch {
      setMsg("Error updating car");
    }
  };

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
        <div className="text-red-600">{msg || "Car not found"}</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-[#2f1c53]">Edit Car</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Brand</label>
          <input
            type="text"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Model</label>
          <input
            type="text"
            name="model"
            value={form.model}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Car Number</label>
          <input
            type="text"
            name="carnumber"
            value={form.carnumber}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 mb-1">Year</label>
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 mb-1">Seats</label>
            <input
              type="number"
              name="seats"
              value={form.seats}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Price Per Day</label>
          <input
            type="number"
            name="pricePerDay"
            value={form.pricePerDay}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 mb-1">Fuel Type</label>
            <select
              name="fuelType"
              value={form.fuelType}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 mb-1">Transmission</label>
            <select
              name="transmission"
              value={form.transmission}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows={3}
            required
          />
        </div>
        {msg && (
          <div className={msg.includes("success") ? "text-green-600" : "text-red-600"}>
            {msg}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-[#2f1c53] hover:bg-[#3d3356] text-white py-2 rounded font-semibold transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditCar;