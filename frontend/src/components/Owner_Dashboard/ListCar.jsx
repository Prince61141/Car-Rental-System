import React, { useState } from "react";

function ListCar({ onAddCar, onClose }) {
  const [step, setStep] = useState(1);
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
    setCarForm((prev) => ({
      ...prev,
      images: [...e.target.files].slice(0, 5),
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

  const handleCarSubmit = (e) => {
    e.preventDefault();
    if (
      !carForm.title ||
      !carForm.brand ||
      !carForm.model ||
      !carForm.carnumber ||
      !carForm.pricePerDay ||
      !carForm.year ||
      carForm.images.length === 0 ||
      !carForm.documents.rc ||
      !carForm.documents.insurance ||
      !carForm.documents.pollution
    ) {
      alert("Please fill all required fields and upload all documents.");
      return;
    }

    onAddCar(carForm);

    setCarForm({
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

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={step === 4 ? handleCarSubmit : handleNext}
        className="bg-white p-6 rounded shadow-lg w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold text-[#3d3356]">List a New Car</h2>

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
              className="w-full border px-4 py-2 rounded"
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
                <img
                  key={idx}
                  src={URL.createObjectURL(img)}
                  alt="Car"
                  className="w-16 h-12 object-cover rounded border"
                />
              ))}
            </div>

            <label className="block mt-4 mb-1 font-medium">
              Upload Documents (PDF/Image)
            </label>
            <input
              type="file"
              name="rc"
              accept="application/pdf,image/*"
              onChange={handleDocumentUpload}
              className="w-full mb-2"
              required
            />
            <input
              type="file"
              name="insurance"
              accept="application/pdf,image/*"
              onChange={handleDocumentUpload}
              className="w-full mb-2"
              required
            />
            <input
              type="file"
              name="pollution"
              accept="application/pdf,image/*"
              onChange={handleDocumentUpload}
              className="w-full mb-2"
              required
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
                className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition"
              >
                List Car
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default ListCar;