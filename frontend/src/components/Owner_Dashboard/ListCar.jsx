import React, { useState } from "react";

function ListCar({ onCarAdded, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [carForm, setCarForm] = useState({
    title: "",
    brand: "",
    model: "",
    carnumber: "",
    year: "",
    pricePerDay: "",
    fuelType: "",
    transmission: "",
    seats: "",
    location: {
      city: "",
      state: "",
      country: "India",
      addressLine: "",
      pincode: "",
    },
    availability: true,
    images: [],
    documents: {
      rc: null,
      insurance: null,
      pollution: null,
    },
    description: "",
  });

  const handleCarFormChange = (e) => {
    const { name, value } = e.target;
    if (["city", "state", "country", "addressLine", "pincode"].includes(name)) {
      setCarForm((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value,
        },
      }));
    } else {
      setCarForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCarImage = (e) => {
    const files = [...e.target.files].slice(0, 5);
    setCarForm((prev) => ({
      ...prev,
      images: files,
    }));
  };

  const removeImage = (index) => {
    setCarForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleDocumentUpload = (e) => {
    const { name, files } = e.target;
    setCarForm((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: files[0],
      },
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep((prev) => prev + 1);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setStep((prev) => prev - 1);
  };

  const handleCarSubmit = async (e) => {
    e.preventDefault();
    const {
      title,
      brand,
      model,
      carnumber,
      pricePerDay,
      year,
      images,
      documents: { rc, insurance, pollution },
    } = carForm;

    if (
      !title ||
      !brand ||
      !model ||
      !carnumber ||
      !pricePerDay ||
      !year ||
      images.length === 0 ||
      !rc ||
      !insurance ||
      !pollution
    ) {
      alert("Please fill all required fields and upload all documents.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      // Append all carForm fields to formData
      formData.append("title", carForm.title);
      formData.append("brand", carForm.brand);
      formData.append("model", carForm.model);
      formData.append("carnumber", carForm.carnumber);
      formData.append("year", carForm.year);
      formData.append("pricePerDay", carForm.pricePerDay);
      formData.append("fuelType", carForm.fuelType);
      formData.append("transmission", carForm.transmission);
      formData.append("seats", carForm.seats);
      formData.append("location", JSON.stringify(carForm.location));
      formData.append("description", carForm.description);

      carForm.images.forEach((img) => {
        formData.append("images", img);
      });

      if (carForm.documents) {
        formData.append("rc", carForm.documents.rc);
        formData.append("insurance", carForm.documents.insurance);
        formData.append("pollution", carForm.documents.pollution);
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
        if (onCarAdded) onCarAdded(data.car); // notify parent
        setLoading(false);
        onClose();
      } else {
        alert(data.message || "Failed to add car");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={step === 4 ? handleCarSubmit : handleNext}
        className="bg-white p-6 rounded shadow-lg w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#3d3356]">List a New Car</h2>
          <span className="text-sm text-gray-500">Step {step} of 4</span>
        </div>

        {step === 1 && (
          <>
            <input
              type="text"
              name="title"
              value={carForm.title}
              onChange={handleCarFormChange}
              required
              placeholder="Title"
              className="w-full border px-4 py-2 rounded mb-2"
            />
            <input
              type="text"
              name="brand"
              value={carForm.brand}
              onChange={handleCarFormChange}
              required
              placeholder="Brand"
              className="w-full border px-4 py-2 rounded mb-2"
            />
            <input
              type="text"
              name="model"
              value={carForm.model}
              onChange={handleCarFormChange}
              required
              placeholder="Model"
              className="w-full border px-4 py-2 rounded mb-2"
            />
            <input
              type="text"
              name="carnumber"
              value={carForm.carnumber}
              onChange={handleCarFormChange}
              required
              className="w-full border px-4 py-2 rounded mb-2"
              placeholder="Car Number (e.g. MH12AB1234)"
            />
            <input
              type="number"
              name="year"
              value={carForm.year}
              onChange={handleCarFormChange}
              required
              placeholder="Year"
              className="w-full border px-4 py-2 rounded mb-2"
            />
            <input
              type="number"
              name="pricePerDay"
              value={carForm.pricePerDay}
              onChange={handleCarFormChange}
              required
              placeholder="Price Per Day (₹)"
              className="w-full border px-4 py-2 rounded mb-2"
            />

            <select
              name="fuelType"
              value={carForm.fuelType}
              onChange={handleCarFormChange}
              required
              className="w-full border px-4 py-2 rounded mb-2"
            >
              <option value="">Select Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="CNG">CNG</option>
            </select>

            <select
              name="transmission"
              value={carForm.transmission}
              onChange={handleCarFormChange}
              required
              className="w-full border px-4 py-2 rounded mb-2"
            >
              <option value="">Select Transmission</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>

            <input
              type="number"
              name="seats"
              value={carForm.seats}
              onChange={handleCarFormChange}
              required
              placeholder="Seating Capacity"
              className="w-full border px-4 py-2 rounded mb-2"
            />

            <button
              type="button"
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
              onClick={handleNext}
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              name="city"
              value={carForm.location.city}
              onChange={handleCarFormChange}
              required
              placeholder="City"
              className="w-full border px-4 py-2 rounded mb-2"
            />
            <input
              type="text"
              name="state"
              value={carForm.location.state}
              onChange={handleCarFormChange}
              required
              placeholder="State"
              className="w-full border px-4 py-2 rounded mb-2"
            />
            <input
              type="text"
              name="country"
              value={carForm.location.country}
              onChange={handleCarFormChange}
              placeholder="Country"
              className="w-full border px-4 py-2 rounded mb-2"
            />
            <input
              type="text"
              name="addressLine"
              value={carForm.location.addressLine}
              onChange={handleCarFormChange}
              placeholder="Address Line"
              className="w-full border px-4 py-2 rounded mb-2"
            />
            <input
              type="text"
              name="pincode"
              value={carForm.location.pincode}
              onChange={handleCarFormChange}
              placeholder="Pincode"
              className="w-full border px-4 py-2 rounded mb-2"
            />

            <div className="flex justify-between">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-300"
                onClick={handlePrev}
              >
                Back
              </button>
              <button
                type="button"
                className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <label className="block mb-1 font-medium">
              Upload Car Images (Max 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleCarImage}
              className="w-full"
              required
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {carForm.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt="Car"
                    className="w-16 h-12 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-[-6px] right-[-6px] bg-red-500 text-white text-xs rounded-full px-1"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>

            <label className="block mt-4 mb-1 font-medium">
              Upload Documents
            </label>
            {["rc", "insurance", "pollution"].map((doc) => (
              <input
                key={doc}
                type="file"
                name={doc}
                accept="application/pdf,image/*"
                onChange={handleDocumentUpload}
                className="w-full mb-2"
                required
              />
            ))}

            <div className="flex justify-between">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-300"
                onClick={handlePrev}
              >
                Back
              </button>
              <button
                type="button"
                className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <textarea
              name="description"
              value={carForm.description}
              onChange={handleCarFormChange}
              rows={4}
              className="w-full border px-4 py-2 rounded"
              placeholder="Write something about your car (features, condition, rules)"
              required
            />
            <div className="flex justify-between pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-300"
                onClick={handlePrev}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition"
              >
                {loading ? "Listing..." : "List Car"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default ListCar;